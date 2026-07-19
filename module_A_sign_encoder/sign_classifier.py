# module_A_sign_encoder/sign_classifier.py
"""
sign_classifier.py

Module A: 手语 Token 分类器

职责（严格遵守三层语义隔离）：
    将 mediapipe_extractor 输出的 543 个人体关键点（Landmarks）
    转换为标准化的手语 Token 序列（sign_sequence）。

    它只回答："视频里依次出现了哪些手语词汇？"
    它绝不回答："用户想表达什么意思？"（那是 Module B 的职责）

接口：
    predict_tokens(video_id, landmarks, use_ai=False, label_map_path=None)
        -> {
            "sign_sequence": ["阿姨", "药"],
            "token_details": [...],
            "overall_confidence": 0.91
        }

设计原则：
    1. MVP 阶段使用 demo_label_map.json 查表（P0 + P1）
    2. 预留 AI 接口（P2），AI 模型直接接收 landmarks 作为输入
    3. inference.py 只调用 predict_tokens()，内部实现可替换（P3）
    4. 归一化 -> 校验 -> 回退，保证系统永不崩溃（文档 Page 16）
    5. 所有输出统一经过 build_prediction_result()

作者：
    Module A
"""

from __future__ import annotations

import copy
import json
import logging
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List, Optional

# ==========================================================
# 项目根目录解析（保证路径在任何工作目录下都能工作）
# ==========================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_LABEL_MAP_PATH = PROJECT_ROOT / "data" / "labels" / "demo_label_map.json"


def _resolve_label_map_path(label_map_path: Optional[Path | str] = None) -> Path:
    """将标签文件路径解析为项目根目录下的绝对路径。"""
    if label_map_path is None:
        return DEFAULT_LABEL_MAP_PATH

    path = Path(label_map_path)
    if not path.is_absolute():
        path = PROJECT_ROOT / path
    return path

# ==========================================================
# 日志
# ==========================================================

logger = logging.getLogger(__name__)
LOG_PREFIX = "[Classifier]"


def _log_info(msg: str) -> None:
    logger.info(f"{LOG_PREFIX} {msg}")


def _log_warning(msg: str) -> None:
    logger.warning(f"{LOG_PREFIX} {msg}")


def _log_error(msg: str) -> None:
    logger.error(f"{LOG_PREFIX} {msg}")


# ==========================================================
# 常量
# ==========================================================

REQUIRED_TOKEN_FIELDS = {"token", "start_sec", "end_sec", "confidence", "modalities"}
DEFAULT_SOURCE = "rule"


# ==========================================================
# 加载 Label Map（带缓存，支持任意路径）
# ==========================================================

def _is_valid_label_entry(entry: Any) -> bool:
    """校验单个标签条目是否具备最小可用结构。"""
    if not isinstance(entry, dict):
        return False

    sign_sequence = entry.get("sign_sequence")
    if not isinstance(sign_sequence, list) or not all(isinstance(token, str) for token in sign_sequence):
        return False

    token_details = entry.get("token_details")
    if not isinstance(token_details, list):
        return False

    for detail in token_details:
        if not isinstance(detail, dict):
            return False
        missing = REQUIRED_TOKEN_FIELDS - set(detail.keys())
        if missing:
            return False
        if not isinstance(detail.get("token"), str):
            return False
        for field in ("start_sec", "end_sec"):
            if not isinstance(detail.get(field), (int, float)):
                return False
        if detail.get("end_sec", 0) < detail.get("start_sec", 0):
            return False
        if not isinstance(detail.get("confidence"), (int, float)):
            return False
        if not (0 <= detail.get("confidence", 0) <= 1):
            return False
        if not isinstance(detail.get("modalities"), list):
            return False

    overall_confidence = entry.get("overall_confidence")
    if not isinstance(overall_confidence, (int, float)):
        return False
    if not (0 <= overall_confidence <= 1):
        return False

    return True


@lru_cache(maxsize=None)
def load_label_map(label_map_path: str = str(DEFAULT_LABEL_MAP_PATH)) -> Dict[str, Any]:
    """
    加载 demo_label_map.json 文件，使用 lru_cache 缓存。

    参数:
        label_map_path: 标签映射文件路径（字符串形式，以支持缓存）

    返回:
        dict: 视频 ID 到 Token 结果的映射表，失败时返回空字典
    """
    path = _resolve_label_map_path(label_map_path)

    if not path.exists():
        _log_warning(f"标签映射文件不存在: {path}，返回空映射表")
        return {}

    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        _log_error(f"标签映射文件 JSON 解析失败: {e}")
        return {}
    except Exception as e:
        _log_error(f"加载标签映射文件时发生未知错误: {e}")
        return {}

    # 校验 JSON 顶层是否为 dict
    if not isinstance(data, dict):
        _log_error("标签映射文件顶层必须是 dict")
        return {}

    # 校验每个 entry 是否为有效格式
    valid_entries = {}
    for key, value in data.items():
        if not _is_valid_label_entry(value):
            _log_warning(f"标签 '{key}' 格式无效，已跳过")
            continue
        valid_entries[key] = copy.deepcopy(value)

    _log_info(f"成功加载标签映射表，共 {len(valid_entries)} 个有效条目")
    return valid_entries


# ==========================================================
# 输出归一化（尝试修正可修复的问题）
# ==========================================================

def _normalize_token_detail(detail: Dict[str, Any], source_hint: str = DEFAULT_SOURCE) -> Dict[str, Any]:
    """修正单个 token_detail 中的可修复问题。"""
    normalized = dict(detail)

    # 确保 token 是字符串
    if "token" not in normalized:
        normalized["token"] = "未知"
    if not isinstance(normalized["token"], str):
        normalized["token"] = str(normalized["token"])

    # 确保 start_sec / end_sec 是数字，且 end_sec >= start_sec
    for field in ("start_sec", "end_sec"):
        if field not in normalized or not isinstance(normalized[field], (int, float)):
            normalized[field] = 0.0
    if normalized["end_sec"] < normalized["start_sec"]:
        normalized["start_sec"], normalized["end_sec"] = normalized["end_sec"], normalized["start_sec"]

    # 确保 confidence 在 0-1 之间
    conf = normalized.get("confidence", 0.5)
    if not isinstance(conf, (int, float)):
        conf = 0.5
    normalized["confidence"] = max(0.0, min(1.0, float(conf)))

    # 确保 modalities 是列表
    modalities = normalized.get("modalities", ["hand"])
    if not isinstance(modalities, list):
        modalities = list(modalities) if modalities else ["hand"]
    normalized["modalities"] = modalities

    # source 字段用于后续调试和知识库增强
    normalized["source"] = normalized.get("source") or source_hint
    if not isinstance(normalized["source"], str):
        normalized["source"] = str(normalized["source"])

    return normalized


def _normalize_prediction(result: Dict[str, Any], source_hint: str = DEFAULT_SOURCE) -> Dict[str, Any]:
    """
    修正预测结果中的可修复问题（缺失字段、类型错误、范围错误）。
    这是保证系统稳定性的第一道防线。
    """
    normalized = copy.deepcopy(result)

    # 确保 sign_sequence 是列表
    if "sign_sequence" not in normalized or not isinstance(normalized["sign_sequence"], list):
        normalized["sign_sequence"] = ["未知"]

    # 确保每个元素是字符串
    normalized["sign_sequence"] = [str(s) for s in normalized["sign_sequence"]]

    # 确保 overall_confidence 在 0-1 之间
    conf = normalized.get("overall_confidence", 0.5)
    if not isinstance(conf, (int, float)):
        conf = 0.5
    normalized["overall_confidence"] = max(0.0, min(1.0, float(conf)))

    # 确保 token_details 是列表，并归一化每个元素
    if "token_details" not in normalized or not isinstance(normalized["token_details"], list):
        normalized["token_details"] = []

    normalized["token_details"] = [
        _normalize_token_detail(d, source_hint=source_hint) for d in normalized["token_details"]
    ]

    # 如果 sign_sequence 和 token_details 长度不一致，修正
    if len(normalized["sign_sequence"]) != len(normalized["token_details"]):
        _log_warning(
            f"sign_sequence ({len(normalized['sign_sequence'])}) 与 "
            f"token_details ({len(normalized['token_details'])}) 长度不一致，正在修正"
        )
        # 以 sign_sequence 为准重建 token_details
        new_details = []
        for i, token in enumerate(normalized["sign_sequence"]):
            if i < len(normalized["token_details"]):
                detail = normalized["token_details"][i]
                detail["token"] = token
                new_details.append(detail)
            else:
                new_details.append({
                    "token": token,
                    "start_sec": 0.0,
                    "end_sec": 1.0,
                    "confidence": 0.5,
                    "modalities": ["hand"],
                })
        normalized["token_details"] = new_details

    return normalized


# ==========================================================
# 输出校验（严格）
# ==========================================================

def _validate_token_details(token_details: List[Dict[str, Any]]) -> bool:
    """严格校验 token_details 中的每个元素。"""
    if not isinstance(token_details, list):
        return False

    for idx, detail in enumerate(token_details):
        if not isinstance(detail, dict):
            _log_error(f"token_details[{idx}] 不是字典")
            return False

        missing = REQUIRED_TOKEN_FIELDS - set(detail.keys())
        if missing:
            _log_error(f"token_details[{idx}] 缺少字段: {missing}")
            return False

        # token 必须是字符串
        if not isinstance(detail.get("token"), str):
            _log_error(f"token_details[{idx}].token 不是字符串")
            return False

        # start_sec / end_sec 必须是数字且 end >= start
        for field in ("start_sec", "end_sec"):
            if not isinstance(detail.get(field), (int, float)):
                _log_error(f"token_details[{idx}].{field} 不是数字")
                return False
        if detail["end_sec"] < detail["start_sec"]:
            _log_error(f"token_details[{idx}] end_sec < start_sec")
            return False

        # confidence 必须在 0-1 之间
        if not isinstance(detail.get("confidence"), (int, float)):
            _log_error(f"token_details[{idx}].confidence 不是数字")
            return False
        if not (0 <= detail["confidence"] <= 1):
            _log_error(f"token_details[{idx}].confidence 不在 0-1 之间")
            return False

        # modalities 必须是列表
        if not isinstance(detail.get("modalities"), list):
            _log_error(f"token_details[{idx}].modalities 不是列表")
            return False

        # source 如果存在，必须是字符串
        if "source" in detail and not isinstance(detail.get("source"), str):
            _log_error(f"token_details[{idx}].source 不是字符串")
            return False

    return True


def _validate_prediction(result: Dict[str, Any]) -> bool:
    """
    校验预测结果是否包含所有必需字段，且字段类型正确。
    在调用此函数之前，应先调用 _normalize_prediction()。
    """
    required_top = {"sign_sequence", "token_details", "overall_confidence"}
    if not all(f in result for f in required_top):
        _log_error(f"预测结果缺少必需字段: {required_top - set(result.keys())}")
        return False

    if not isinstance(result["sign_sequence"], list):
        _log_error("sign_sequence 必须是列表")
        return False

    if not all(isinstance(s, str) for s in result["sign_sequence"]):
        _log_error("sign_sequence 中的所有元素必须是字符串")
        return False

    if not isinstance(result["overall_confidence"], (int, float)):
        _log_error("overall_confidence 必须是数字")
        return False

    if not (0 <= result["overall_confidence"] <= 1):
        _log_error("overall_confidence 必须在 0-1 之间")
        return False

    if len(result["sign_sequence"]) != len(result["token_details"]):
        _log_error("sign_sequence 和 token_details 长度不一致")
        return False

    return _validate_token_details(result["token_details"])


# ==========================================================
# 统一输出构建器（所有出口统一经过这里）
# ==========================================================

def _finalize_prediction(result: Dict[str, Any], video_id: str = "unknown", source_hint: str = DEFAULT_SOURCE) -> Dict[str, Any]:
    """归一化、校验并返回标准输出；若非法则回退。"""
    normalized = _normalize_prediction(result, source_hint=source_hint)
    if _validate_prediction(normalized):
        return normalized

    _log_error("归一化后仍校验失败，返回回退结果")
    return _build_fallback_result(video_id)


def _build_fallback_result(video_id: str = "unknown") -> Dict[str, Any]:
    """
    构建回退结果（每次调用返回新对象，避免全局污染）。
    文档 Page 16 要求：未知视频返回 "未知" token，confidence=0.30。
    """
    _log_warning(f"video_id='{video_id}' 未命中任何分类器，返回回退结果")
    return _finalize_prediction(
        {
            "sign_sequence": ["未知"],
            "token_details": [
                {
                    "token": "未知",
                    "start_sec": 0.0,
                    "end_sec": 1.0,
                    "confidence": 0.30,
                    "modalities": ["hand"],
                }
            ],
            "overall_confidence": 0.30,
        },
        video_id=video_id,
        source_hint="fallback",
    )


# ==========================================================
# 规则分类器（Demo 查表）
# ==========================================================

def _rule_predict(video_id: str, label_map: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    基于 Demo 标签映射表的规则分类器。
    MVP 阶段的主要分类方法。
    """
    if video_id in label_map:
        _log_info(f"规则分类器命中: video_id='{video_id}'")
        # 深拷贝避免污染缓存
        return copy.deepcopy(label_map[video_id])
    return None


# ==========================================================
# AI 推理接口（预留）
# ==========================================================

class AIPredictor:
    """轻量级可注入 AI 预测接口，后续可直接挂接真实模型。"""

    model = None

    @classmethod
    def predict(cls, landmarks: List[Dict]) -> Optional[Dict[str, Any]]:
        if cls.model is None:
            _log_info("AI 模型未接入，当前返回 None")
            return None
        return cls.model.predict(landmarks)


def _ai_predict(landmarks: List[Dict]) -> Optional[Dict[str, Any]]:
    """未来接入真实 AI 模型时，在这里替换为实际推理逻辑。"""
    return AIPredictor.predict(landmarks)


# ==========================================================
# 公开接口
# ==========================================================

def predict_tokens(
    video_id: str,
    landmarks: List[Dict],  # 注意：当前 rule 模式未使用 landmarks，但为了未来 AI 替换保留
    use_ai: bool = False,
    label_map_path: Optional[Path] = None,
) -> Dict[str, Any]:
    """
    Module A 唯一公开接口：将 landmarks 转换为手语 Token 序列。

    这是 inference.py 唯一调用的函数。

    参数:
        video_id: 视频文件名（不含后缀），用于规则分类查表
        landmarks: 来自 mediapipe_extractor 的关键点列表（当前 rule 模式未使用，为 AI 预留）
        use_ai: 是否启用 AI 模式（默认 False）
        label_map_path: 标签映射文件路径（可选）

    返回:
        dict: 标准格式的 Token 结果，保证包含所有必需字段

    注意:
        当前 MVP 阶段默认使用 rule 模式（查表），landmarks 参数虽然传入但暂未使用。
        这是为了保持接口稳定，未来切换到 AI 模式时 inference.py 不需要任何修改。
    """
    if not isinstance(landmarks, list) or not landmarks:
        _log_warning(f"video_id='{video_id}' 的 landmarks 无效，直接返回回退结果")
        return _build_fallback_result(video_id)

    # 1. 确定 label_map 路径
    map_path = _resolve_label_map_path(label_map_path)

    # 2. 尝试 AI 推理（如果启用）
    if use_ai:
        _log_info(f"尝试 AI 推理: video_id='{video_id}'")
        ai_result = _ai_predict(landmarks)
        if ai_result is not None:
            return _finalize_prediction(
                {
                    "sign_sequence": ai_result.get("sign_sequence", ["未知"]),
                    "token_details": ai_result.get("token_details", []),
                    "overall_confidence": ai_result.get("overall_confidence", 0.5),
                },
                video_id=video_id,
                source_hint="ai",
            )

    # 3. 规则分类（查表）
    label_map = load_label_map(map_path)
    rule_result = _rule_predict(video_id, label_map)
    if rule_result is not None:
        return _finalize_prediction(
            {
                "sign_sequence": rule_result.get("sign_sequence", ["未知"]),
                "token_details": rule_result.get("token_details", []),
                "overall_confidence": rule_result.get("overall_confidence", 0.5),
            },
            video_id=video_id,
            source_hint="rule",
        )

    # 4. 最终回退
    return _build_fallback_result(video_id)


# ==========================================================
# 轻量级示例入口
# ==========================================================

def build_prediction_result(
    sign_sequence: List[str],
    token_details: List[Dict[str, Any]],
    overall_confidence: float,
    source_hint: str = DEFAULT_SOURCE,
) -> Dict[str, Any]:
    """兼容式统一输出构造器。"""
    return _finalize_prediction(
        {
            "sign_sequence": sign_sequence,
            "token_details": token_details,
            "overall_confidence": overall_confidence,
        },
        source_hint=source_hint,
    )


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

    example = build_prediction_result(
        sign_sequence=["阿姨"],
        token_details=[
            {
                "token": "阿姨",
                "start_sec": 0.0,
                "end_sec": 1.0,
                "confidence": 0.9,
                "modalities": ["hand"],
            }
        ],
        overall_confidence=0.9,
        source_hint="rule",
    )
    print(example)