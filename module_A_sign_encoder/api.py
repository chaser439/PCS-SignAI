from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

import os
import shutil
import logging

from pathlib import Path


from module_A_sign_encoder.inference import run_inference

# ==========================================================
# FastAPI
# ==========================================================

app = FastAPI(
    title="PCS-SignAI Module A API",
    version="1.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)


logger = logging.getLogger(__name__)



# ==========================================================
# 上传目录
# ==========================================================

UPLOAD_DIR = Path("uploads")

UPLOAD_DIR.mkdir(
    exist_ok=True
)



# ==========================================================
# 健康检查
# ==========================================================

@app.get("/")
def root():

    return {

        "service":
            "PCS-SignAI Module A",

        "status":
            "running"

    }



# ==========================================================
# 手语视频分析接口
# ==========================================================


@app.post("/sign/analyze")
async def analyze(

    file: UploadFile = File(...),

    user_id: str = Form(...)

):


    logger.info(
        f"[Module A] 收到视频: {file.filename}"
    )


    # ------------------------------------------------------
    # 1. 保存上传视频
    # ------------------------------------------------------

    save_path = UPLOAD_DIR / file.filename


    with open(
        save_path,
        "wb"
    ) as f:

        shutil.copyfileobj(
            file.file,
            f
        )


    logger.info(
        f"[Module A] 视频保存到: {save_path}"
    )



    # ------------------------------------------------------
    # 2. 调用已有推理流水线
    # ------------------------------------------------------

    result = run_inference(

        video_path=save_path,

        user_id=user_id

    )



    logger.info(
        "[Module A] 推理完成"
    )


    return result