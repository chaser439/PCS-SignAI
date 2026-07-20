"""
video_processor.py

Module A: Video Processor

功能：
1. 读取手语视频
2. 获取视频信息
3. 抽取视频帧
"""

from pathlib import Path
import cv2


# ==========================================================
# 自动定位项目根目录
# ==========================================================
PROJECT_ROOT = Path(__file__).resolve().parent.parent

# demo_cases 文件夹
DEMO_CASES_DIR = PROJECT_ROOT / "demo_cases"


def get_video_info(video_path):
    """
    获取视频基本信息

    Args:
        video_path (str | Path)

    Returns:
        dict
    """

    video_path = Path(video_path)

    if not video_path.exists():
        raise FileNotFoundError(f"Video not found: {video_path}")

    cap = cv2.VideoCapture(str(video_path))

    if not cap.isOpened():
        raise RuntimeError(f"Cannot open video: {video_path}")

    fps = cap.get(cv2.CAP_PROP_FPS)

    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))

    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    duration = frame_count / fps if fps > 0 else 0

    cap.release()

    return {
        "video_path": str(video_path),
        "fps": fps,
        "frame_count": frame_count,
        "width": width,
        "height": height,
        "duration": duration,
    }


def extract_frames(video_path, sample_rate=1):
    """
    抽取视频帧

    Args:
        video_path
        sample_rate:
            每隔多少帧取一帧

    Returns:
        list
    """

    video_path = Path(video_path)

    if not video_path.exists():
        raise FileNotFoundError(f"Video not found: {video_path}")

    cap = cv2.VideoCapture(str(video_path))

    if not cap.isOpened():
        raise RuntimeError(f"Cannot open video: {video_path}")

    frames = []

    frame_index = 0

    while True:

        success, frame = cap.read()

        if not success:
            break

        if frame_index % sample_rate == 0:
            frames.append(frame)

        frame_index += 1

    cap.release()

    return frames


def load_video_frames(video_path, sample_rate=1):
    """兼容旧接口：加载并抽取视频帧。"""
    return extract_frames(video_path, sample_rate=sample_rate)


def process_video(video_path, sample_rate=5):
    """
    Module A 对外接口

    Args:
        video_path
        sample_rate

    Returns:
        dict
    """

    info = get_video_info(video_path)

    frames = extract_frames(
        video_path,
        sample_rate=sample_rate,
    )

    return {
        "info": info,
        "frames": frames,
    }


if __name__ == "__main__":

    # ======================================================
    # 修改这里即可测试不同视频
    # ======================================================

    test_video = DEMO_CASES_DIR / "阿姨.mp4"

    result = process_video(
        test_video,
        sample_rate=5,
    )

    print("=" * 60)
    print("Video Information")
    print("=" * 60)

    for k, v in result["info"].items():
        print(f"{k}: {v}")

    print("=" * 60)
    print(f"Extracted Frames: {len(result['frames'])}")