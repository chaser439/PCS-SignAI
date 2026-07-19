1. 项目介绍
# PCS-SignAI Module B Semantic Brain


Semantic Brain 是 PCS-SignAI 系统中的语义理解模块。

该模块负责将手语序列转换为具有上下文理解能力的中文语义表达。

核心能力包括：

- 手语语义解析
- RAG知识增强
- 用户历史记忆融合
- 大语言模型推理
- 结构化语义输出

# 核心设计特点


## 1. RAG增强语义理解

通过FAISS向量检索，从手语知识库中获取相关语义。


## 2. 用户历史记忆

结合用户过去表达习惯，提高个性化理解能力。


## 3. LLM语义推理

利用DeepSeek结合上下文信息生成自然语言表达。


2. 系统架构
手语输入

↓

知识库检索(RAG)

↓

用户Memory

↓

DeepSeek语义推理

↓

结构化语义结果
3. 环境配置
## 环境要求

Python >= 3.10


安装依赖：

pip install -r requirements.txt
4.DeepSeek配置
## API配置


复制：

.env.example


修改为：

.env


填写：

DEEPSEEK_API_KEY=your_key
5. 知识库构建
## 构建向量知识库


首次运行：

python -m vector_store.build_vector_store


生成：

vector_store/
├── sign_brain.index
└── metadata.json
6.服务启动
## 启动Semantic Brain服务


运行：

python -m uvicorn api.app:app --reload


服务地址：

http://127.0.0.1:8000


接口文档：

http://127.0.0.1:8000/docs
7.API接口说明
请求，例如
{
"user_id":"user001",

"sign_sequence":[
"胃",
"疼"
],

"emotion":{
"type":"pain",
"confidence":0.91
}
}


返回  

{
"semantic_result":{

"intent":
"seek_medical_help",

"expression":
"我的胃很疼，我想去医院检查",

"emotion":
"pain",

"confidence":
0.92

}
}
8.测试方法
## 测试


Pipeline测试：

python -m tests.test_pipeline


API测试：

python -m tests.test_api