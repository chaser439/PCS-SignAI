from fastapi import FastAPI
from pydantic import BaseModel


from pipeline.semantic_pipeline import SemanticPipeline



# ======================
# 创建API应用
# ======================

app = FastAPI(

    title="PCS-SignAI Semantic Brain API",

    description=
    "手语语义理解与推理服务",

    version="1.0"

)



# ======================
# 初始化Pipeline
# ======================

pipeline = SemanticPipeline()



# ======================
# 请求数据结构
# ======================


class SemanticRequest(BaseModel):


    user_id: str


    sign_sequence: list[str]


    emotion: dict | None = None





# ======================
# 返回测试接口
# ======================


@app.get("/")

def root():

    return {

        "service":
        "semantic brain",

        "status":
        "running"

    }





# ======================
# 核心语义分析接口
# ======================


@app.post("/semantic/analyze")

def analyze(
    request: SemanticRequest
):


    result = pipeline.run(

        request.dict()

    )


    return result