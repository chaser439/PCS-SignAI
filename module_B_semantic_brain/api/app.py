from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from pipeline.semantic_pipeline import SemanticPipeline

from api.schema import SignInput



app = FastAPI(

    title="PCS-SignAI Semantic Brain API",

    description="手语语义理解与推理服务",

    version="1.0"

)



# ======================================================
# CORS配置
# 允许React/Vite前端调用Module B接口
# ======================================================

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



# ======================================================
# 初始化语义推理Pipeline
# ======================================================

pipeline = SemanticPipeline()



# ======================================================
# 健康检查接口
# ======================================================

@app.get("/")
def root():

    return {

        "service":
        "semantic brain",

        "status":
        "running"

    }



# ======================================================
# Module A -> Module B
# 手语语义理解接口
# ======================================================

@app.post("/semantic/analyze")
def analyze(

    request: SignInput

):

    result = pipeline.run(

        request.dict()

    )

    return result