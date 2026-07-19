from llm.llm_client import LLMClient


client = LLMClient()


prompt = """

你是一名中文手语语义理解专家。

请根据下面的信息理解用户真实意图。


用户手语:

胃
疼


请严格返回JSON格式:

{
    "intent":"",
    "expression":"",
    "emotion":"",
    "ambiguity":"",
    "confidence":""
}


字段说明:

intent:
用户真实想表达的需求


expression:
转换后的自然中文表达


emotion:
用户当前情绪


ambiguity:
可能存在的不确定信息


confidence:
理解置信度，0-1之间

"""


result = client.generate(prompt)


print(result)