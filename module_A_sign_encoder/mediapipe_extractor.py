# module_A_sign_encoder/mediapipe_extractor.py
"""
mediapipe_extractor.py

Module A: MediaPipe Holistic 关键点提取器

职责：
    将 video_processor.py 输出的帧列表（BGR 图像）转换为每帧的 543 个人体关键点。

输入：
    frames: List[np.ndarray]  —— 由 video_processor.process_video() 返回的 frames

输出：
    List[Dict]  —— 每个字典包含 pose, face, left_hand, right_hand 的归一化坐标列表

接口：
    extract_landmarks(frames: list) -> list

依赖：
    mediapipe, opencv-python, numpy

作者：
    Module A
"""

from __future__ import annotations

import logging
from typing import Dict, List

import cv2
import mediapipe as mp
import numpy as np

# ==========================================================
# 常量定义
# ==========================================================
POSE_POINTS = 33
FACE_POINTS = 468
HAND_POINTS = 21

# MediaPipe 检测置信度阈值
DEFAULT_DETECTION_CONFIDENCE = 0.5
DEFAULT_TRACKING_CONFIDENCE = 0.5

# 配置日志
logger = logging.getLogger(__name__)


def _landmarks_to_array(landmarks, n_points: int) -> np.ndarray:
    """
    将 MediaPipe 的 NormalizedLandmarkList 转换为 (n_points, 3) 的 numpy 数组。

    如果 landmarks 为 None，返回全零数组，保证所有帧的数据结构一致。

    参数:
        landmarks: MediaPipe 返回的 landmark 对象（如 result.pose_landmarks）
        n_points: 该组 landmark 应有的点数（pose:33, face:468, hand:21）

    返回:
        shape (n_points, 3) 的 float32 数组，坐标归一化到 [0, 1]
    """
    arr = np.zeros((n_points, 3), dtype=np.float32)
    if landmarks is None:
        return arr
    # 取前 n_points 个点（通常全部包含，加一层安全保护）
    for i, lm in enumerate(landmarks.landmark[:n_points]):
        arr[i] = [lm.x, lm.y, lm.z]
    return arr


def extract_landmarks(frames: list) -> List[Dict]:
    """
    从帧列表中提取每一帧的 MediaPipe Holistic 关键点。

    这是本模块的唯一公开接口。

    参数:
        frames: list of numpy.ndarray，BGR 图像格式，由 video_processor.py 生成

    返回:
        list of dict，每个 dict 包含：
            {
                "pose": list of list (33, 3),      # 33 个姿态点
                "face": list of list (468, 3),     # 468 个面部点
                "left_hand": list of list (21, 3), # 左手 21 个点
                "right_hand": list of list (21, 3) # 右手 21 个点
            }
        每个坐标均为归一化 [x, y, z] 浮点数。
        如果输入 frames 为空，返回空列表 []。
    """
    if not frames:
        logger.warning("frames 为空，返回空列表")
        return []

    # 初始化 MediaPipe Holistic 模型（只初始化一次）
    holistic = mp.solutions.holistic.Holistic(
        static_image_mode=False,           # 视频流模式，提高速度
        model_complexity=1,                # 1 为中等复杂度，平衡精度与速度
        enable_segmentation=False,         # 不需要分割掩码
        refine_face_landmarks=True,        # 细化面部关键点，提高精度
        min_detection_confidence=DEFAULT_DETECTION_CONFIDENCE,
        min_tracking_confidence=DEFAULT_TRACKING_CONFIDENCE,
    )

    all_frames: List[Dict] = []

    for idx, frame in enumerate(frames):
        try:
            # MediaPipe 要求 RGB 格式
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            result = holistic.process(rgb)

            # 提取四个部分的关键点，转换为 (N, 3) 数组再转为 list
            pose = _landmarks_to_array(result.pose_landmarks, POSE_POINTS)
            face = _landmarks_to_array(result.face_landmarks, FACE_POINTS)
            left_hand = _landmarks_to_array(result.left_hand_landmarks, HAND_POINTS)
            right_hand = _landmarks_to_array(result.right_hand_landmarks, HAND_POINTS)

            frame_data = {
                "pose": pose.tolist(),
                "face": face.tolist(),
                "left_hand": left_hand.tolist(),
                "right_hand": right_hand.tolist(),
            }
            all_frames.append(frame_data)

        except Exception as e:
            # 单帧处理失败时，返回全零关键点，保证整体流程不中断
            logger.warning(f"第 {idx} 帧处理失败: {e}，使用全零关键点")
            zero_pose = np.zeros((POSE_POINTS, 3), dtype=np.float32).tolist()
            zero_face = np.zeros((FACE_POINTS, 3), dtype=np.float32).tolist()
            zero_hand = np.zeros((HAND_POINTS, 3), dtype=np.float32).tolist()
            all_frames.append({
                "pose": zero_pose,
                "face": zero_face,
                "left_hand": zero_hand,
                "right_hand": zero_hand,
            })

    # 释放 MediaPipe 资源
    holistic.close()

    logger.info(f"成功提取 {len(all_frames)} 帧的关键点")
    return all_frames


# ==========================================================
# 独立测试
# ==========================================================
if __name__ == "__main__":
    # 配置日志输出到控制台
    logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

    # 导入已完成的 video_processor，兼容包模式和脚本模式
    try:
        from .video_processor import process_video, DEMO_CASES_DIR
    except ImportError:
        from module_A_sign_encoder.video_processor import process_video, DEMO_CASES_DIR

    # 测试视频路径（确保文件存在）
    test_video = DEMO_CASES_DIR / "阿姨.mp4"

    if not test_video.exists():
        logger.error(f"测试视频不存在: {test_video}")
        logger.info("请将测试视频放入 demo_cases 目录，或修改 test_video 路径")
        exit(1)

    logger.info(f"测试视频: {test_video}")

    # 1. 调用 video_processor 读取视频
    result = process_video(test_video, sample_rate=5)
    frames = result["frames"]
    logger.info(f"video_processor 返回: {result['info']}")
    logger.info(f"抽取帧数: {len(frames)}")

    # 2. 提取 landmarks
    landmarks = extract_landmarks(frames)
    logger.info(f"成功提取 landmark 帧数: {len(landmarks)}")

    # 3. 验证数据结构
    if landmarks:
        first = landmarks[0]
        logger.info("第一帧 landmark 形状:")
        logger.info(f"  pose      : {len(first['pose'])} x {len(first['pose'][0]) if first['pose'] else 0}")
        logger.info(f"  face      : {len(first['face'])} x {len(first['face'][0]) if first['face'] else 0}")
        logger.info(f"  left_hand : {len(first['left_hand'])} x {len(first['left_hand'][0]) if first['left_hand'] else 0}")
        logger.info(f"  right_hand: {len(first['right_hand'])} x {len(first['right_hand'][0]) if first['right_hand'] else 0}")
        logger.info(f"pose 第一个点: {first['pose'][0]}")
    else:
        logger.warning("未提取到任何 landmark 数据")