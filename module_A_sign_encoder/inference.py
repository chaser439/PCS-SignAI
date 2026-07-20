# module_A_sign_encoder/inference.py
"""
inference.py

Module A: 推理流水线（Pipeline Orchestrator）

职责：
    将 Module A 的三个子模块串联成完整流水线：
        1. video_processor      → 读取视频、抽帧
        2. mediapipe_extractor  → 提取人体关键点
        3. sign_classifier      → 识别手语 Token
        4. 组装统一输出         → 生成 sign_output.json

    这是 Module A 的流程编排器（Controller），
    也是整个 Module A 对外暴露的唯一入口。

接口：
    run_inference(video_path, user_id=None, config=None)
        -> dict: 符合 sign_output.json schema 的完整输出

设计原则：
    1. 只做编排，不做识别（识别由 sign_classifier 完成）
    2. 只做组装，不做推理（推理由 Module B 完成）
    3. 错误时返回 status="error" 的 JSON，不抛出异常（文档 Page 18）
    4. 输出严格符合 sign_output.json schema（文档 Page 9）
    5. Module B 只需读取 outputs/sign_output.json，无需了解内部实现

"""

from __future__ import annotations

import json
import logging
import sys
import requests
import argparse
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional

# ==========================================================
# 导入 Module A 子模块
# ==========================================================

from module_A_sign_encoder.video_processor import process_video
from module_A_sign_encoder.mediapipe_extractor import extract_landmarks
from module_A_sign_encoder.sign_classifier import predict_tokens

# ==========================================================
# 项目根目录和输出路径
# ==========================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_OUTPUT_PATH = PROJECT_ROOT / "outputs" / "sign_output.json"
SCHEMA_VERSION = "1.0"
STATUS_OK = "ok"
STATUS_ERROR = "error"
STATUS_TIMEOUT = "timeout"
SUPPORTED_VIDEO_SUFFIXES = {".mp4", ".mov", ".avi", ".mkv", ".webm"}

# ==========================================================
# 日志
# ==========================================================

logger = logging.getLogger(__name__)
LOG_PREFIX = "[Inference]"


def _log_info(msg: str) -> None:
    logger.info(f"{LOG_PREFIX} {msg}")


def _log_error(msg: str) -> None:
    logger.error(f"{LOG_PREFIX} {msg}")


def _log_warning(msg: str) -> None:
    logger.warning(f"{LOG_PREFIX} {msg}")


# ==========================================================
# 配置
# ==========================================================

@dataclass
class InferenceConfig:
    """推理流水线配置。"""

    sample_rate: int = 5
    output_path: Path = DEFAULT_OUTPUT_PATH
    timeout_seconds: int = 60
    classifier_config: Optional[Dict[str, Any]] = None


# ==========================================================
# 输入校验
# ==========================================================

def _validate_input(video_path: Path) -> None:
    """校验输入视频路径。"""
    video_path = Path(video_path)
    if not video_path.exists():
        raise FileNotFoundError(f"视频文件不存在: {video_path}")
    if not video_path.is_file():
        raise FileNotFoundError(f"路径不是文件: {video_path}")
    if video_path.suffix.lower() not in SUPPORTED_VIDEO_SUFFIXES:
        raise ValueError(f"不支持的视频格式: {video_path.suffix}")


# ==========================================================
# 输出构建
# ==========================================================

def _compute_non_manual_cues(landmarks: List[Dict]) -> Dict[str, float]:
    """
    计算非手部线索（MVP 占位实现）。

    文档 Page 9 要求：
        non_manual_cues: {motion_intensity, brow_raise, mouth_open, face_tension}

    当前 MVP 阶段返回固定值，后续可用 face landmarks 细化。
    """
    # TODO: 基于 landmarks 中的 face 关键点计算真实表情特征
    # 例如：面部关键点坐标变化 → 表情强度
    return {
        "motion_intensity": 0.5,
        "brow_raise": 0.2,
        "mouth_open": 0.1,
        "face_tension": 0.6,
    }


def _build_output(
    video_id: str,
    user_id: Optional[str],
    video_path: Path,
    video_info: Dict[str, Any],
    prediction: Dict[str, Any],
    non_manual_cues: Dict[str, float],
    status: str,
    landmark_frames: int = 0,
    detected_frames: int = 0,
) -> Dict[str, Any]:
    """
    构建符合 sign_output.json schema 的输出字典。
    """
    return {
        "schema_version": SCHEMA_VERSION,
        "video_id": video_id,
        "video_name": video_path.name,
        "user_id": user_id,
        "status": status,
        "source_path": str(video_path),
        "fps": video_info.get("fps", 25.0),
        "duration": video_info.get("duration", 0.0),
        "sample_rate": video_info.get("sample_rate", 0),
        "frame_count": video_info.get("frame_count", 0),
        "landmark_frames": landmark_frames,
        "detected_frames": detected_frames,
        "sign_sequence": prediction.get("sign_sequence", []),
        "token_details": prediction.get("token_details", []),
        "non_manual_cues": non_manual_cues,
        "overall_confidence": prediction.get("overall_confidence", 0.0),
        "error": None,
    }


def _build_error_output(
    video_id: str,
    user_id: Optional[str],
    video_path: Path,
    error_code: str,
    error_message: str,
) -> Dict[str, Any]:
    """
    构建错误输出（文档 Page 18 要求）。
    """
    return {
        "schema_version": SCHEMA_VERSION,
        "video_id": video_id,
        "video_name": video_path.name,
        "user_id": user_id,
        "status": STATUS_ERROR,
        "source_path": str(video_path),
        "fps": 0.0,
        "duration": 0.0,
        "sample_rate": 0,
        "frame_count": 0,
        "landmark_frames": 0,
        "detected_frames": 0,
        "sign_sequence": [],
        "token_details": [],
        "non_manual_cues": {},
        "overall_confidence": 0.0,
        "error": {
            "code": error_code,
            "message": error_message,
        },
    }


def _save_output(result: Dict[str, Any], output_path: Path) -> Path:
    """将输出字典保存为 JSON 文件，并返回保存路径。"""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    return output_path


# ==========================================================
# 公开接口（Module A 唯一对外入口）
# ==========================================================

def run_inference(
    video_path: Path,
    user_id: Optional[str] = None,
    config: Optional[InferenceConfig] = None,
) -> Dict[str, Any]:
    """
    Module A 唯一公开接口：执行完整推理流水线。

    这是整个 Module A 对外暴露的唯一入口。
    Module B / C / 任何外部调用者只需调用此函数，
    无需了解 video_processor、mediapipe_extractor、sign_classifier 的存在。

    参数:
        video_path: 视频文件路径
        user_id: 用户标识（可选，透传给 sign_output.json）
        config: 推理配置（可选）

    返回:
        dict: 符合 sign_output.json schema 的输出
              - status="ok": 正常结果
              - status="error": 错误信息
              - status="timeout": 超时（当前未实现，预留）

    示例:
        >>> result = run_inference("data/videos/demo_cases/阿姨.mp4")
        >>> print(result["sign_sequence"])
        ['阿姨']
    """
    if config is None:
        config = InferenceConfig()

    video_path = Path(video_path)
    video_id = video_path.stem
    classifier_config = config.classifier_config or {}

    _log_info(f"开始处理: {video_path.name} (user_id={user_id})")

    # ==========================================================
    # 整个流水线被 try-except 包裹
    # 任何异常都会转化为 status="error" 的 JSON（文档 Page 18）
    # ==========================================================
    try:
        # ---- Step 1: 校验输入 ----
        _validate_input(video_path)

        # ---- Step 2: 读取视频 ----
        _log_info("Step 1: 读取视频...")
        video_result = process_video(video_path, sample_rate=config.sample_rate)
        frames = video_result["frames"]
        video_info = video_result["info"]
        video_info["sample_rate"] = config.sample_rate

        if not frames:
            raise RuntimeError(f"视频 {video_path} 抽取帧数为 0")

        _log_info(f"  帧数: {len(frames)}, FPS: {video_info['fps']:.2f}")

        # ---- Step 3: 提取关键点 ----
        _log_info("Step 2: 提取 MediaPipe 关键点...")
        landmarks = extract_landmarks(frames)

        if not landmarks:
            raise RuntimeError("MediaPipe 未提取到任何关键点")

        _log_info(f"  关键点帧数: {len(landmarks)}")

        # ---- Step 4: Token 识别 ----
        _log_info("Step 3: 手语 Token 识别...")
        prediction = predict_tokens(
            video_id=video_id,
            landmarks=landmarks,
            use_ai=classifier_config.get("use_ai", False),
            label_map_path=classifier_config.get("label_map_path"),
        )

        _log_info(f"  sign_sequence: {prediction.get('sign_sequence', [])}")

        # ---- Step 5: 计算非手部线索（MVP 占位） ----
        non_manual_cues = _compute_non_manual_cues(landmarks)

        # ---- Step 6: 组装输出 ----
        _log_info("Step 4: 组装输出...")
        result = _build_output(
            video_id=video_id,
            user_id=user_id,
            video_path=video_path,
            video_info=video_info,
            prediction=prediction,
            non_manual_cues=non_manual_cues,
            status=STATUS_OK,
            landmark_frames=len(landmarks),
            detected_frames=len(landmarks),
        )

        # ---- Step 7: 保存 JSON ----
        _log_info(f"Step 5: 保存到 {config.output_path}")
        saved_path = _save_output(result, config.output_path)
        result["saved_to"] = str(saved_path)

        _log_info("✅ 流水线完成")
        return result

    except FileNotFoundError as e:
        logger.exception("文件不存在")
        return _build_error_output(video_id, user_id, video_path, "FILE_NOT_FOUND", str(e))

    except RuntimeError as e:
        logger.exception("运行时错误")
        return _build_error_output(video_id, user_id, video_path, "RUNTIME_ERROR", str(e))

    except Exception as e:
        logger.exception("未知错误")
        return _build_error_output(video_id, user_id, video_path, "UNKNOWN_ERROR", str(e))


def _get_demo_videos() -> List[Path]:
    """
    自动读取 demo_cases 目录下所有支持的视频文件。

    返回:
        List[Path]
    """

    demo_dir = PROJECT_ROOT / "demo_cases"

    if not demo_dir.exists():
        return []

    videos = []

    for file in demo_dir.iterdir():

        if (
            file.is_file()
            and file.suffix.lower()
            in SUPPORTED_VIDEO_SUFFIXES
        ):
            videos.append(file)


    return sorted(videos)


# ==========================================================
# 命令行入口（独立测试）
# ==========================================================

def main() -> None:
    """
    Module A 命令行入口。

    使用方式：

    1. 默认读取 demo_cases 中第一个视频：
    
        python -m module_A_sign_encoder.inference


    2. 指定视频：

        python -m module_A_sign_encoder.inference \
        --video demo_cases/test.mp4


    输出：
        outputs/sign_output.json

    该 JSON 将作为 Module B 输入。
    """

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(levelname)s - %(message)s"
    )


    # ======================================================
    # 参数解析
    # ======================================================

    parser = argparse.ArgumentParser(
        description="Module A Sign Encoder Inference"
    )


    parser.add_argument(
        "--video",
        type=str,
        default=None,
        help="输入手语视频路径"
    )


    parser.add_argument(
        "--user-id",
        type=str,
        default="test_user_001",
        help="用户ID，用于个性化记忆"
    )


    args = parser.parse_args()



    print("=" * 70)
    print("Module A 推理流水线 (inference.py)")
    print("=" * 70)



    # ======================================================
    # 视频选择
    # ======================================================

    if args.video:

        videos = [
            Path(args.video)
        ]

    else:

        videos = _get_demo_videos()



    if not videos:

        print(
            "❌ 未找到输入视频"
        )

        print(
            f"支持格式: {SUPPORTED_VIDEO_SUFFIXES}"
        )

        sys.exit(1)



    print(
        f"✅ 找到 {len(videos)} 个视频:"
    )


    for video in videos:

        print(
            f"   - {video.name}"
        )



    # ======================================================
    # 执行Module A
    # ======================================================

    for video_path in videos:


        print("\n")

        print("=" * 70)

        print(
            f"开始处理: {video_path.name}"
        )

        print("=" * 70)



        result = run_inference(

            video_path=video_path,

            user_id=args.user_id

        )



        print("\n")

        print("-" * 70)

        print("Module A 输出")

        print("-" * 70)



        print(
            json.dumps(
                result,
                ensure_ascii=False,
                indent=2
            )
        )



        print("\n关键结果:")


        print(
            "手语序列:",
            result.get(
                "sign_sequence",
                []
            )
        )


        print(
            "置信度:",
            result.get(
                "overall_confidence",
                0
            )
        )


        print(
            "状态:",
            result.get(
                "status"
            )
        )



    print("\n")

    print("=" * 70)

    print(
        "Module A 推理完成"
    )

    print(
        "输出文件:"
        f"{DEFAULT_OUTPUT_PATH}"
    )

    print("=" * 70)



if __name__ == "__main__":

    main()