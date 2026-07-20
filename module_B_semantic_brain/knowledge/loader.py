import json
from pathlib import Path

from knowledge.schema import KnowledgeDocument


BASE_DIR = Path(__file__).resolve().parent

RAW_PATH = BASE_DIR / "raw_docs"



def load_json_file(path):

    with open(
        path,
        "r",
        encoding="utf-8"
    ) as f:

        return json.load(f)



def load_all_documents():

    documents = []


    # ==============================
    # 1. 手语语义知识
    # ==============================

    data = load_json_file(
        RAW_PATH / "sign_semantics.json"
    )


    for item in data:


        content = f"""
手语动作:
{",".join(item["gloss"])}


语义:
{item["meaning"]}


中文表达:
{item["chinese"]}


用户意图:
{item.get("intent","unknown")}


应用场景:
{item.get("scenario","unknown")}


情绪状态:
{item.get("emotion","unknown")}
"""


        documents.append(

            KnowledgeDocument(

                id=item["id"],

                content=content.strip(),

                category=item.get(
                    "category",
                    "sign"
                ),

                source="sign_semantics",


                metadata={

                    "emotion":
                    item.get(
                        "emotion",
                        "unknown"
                    ),


                    "intent":
                    item.get(
                        "intent",
                        "unknown"
                    ),


                    "scenario":
                    item.get(
                        "scenario",
                        "unknown"
                    ),


                    "gloss":
                    item.get(
                        "gloss",
                        []
                    )

                }

            )

        )



    # ==============================
    # 2. 中国文化知识
    # ==============================


    data = load_json_file(
        RAW_PATH/"chinese_culture.json"
    )


    for item in data:


        content = f"""

文化表达:
{item["expression"]}


字面含义:
{item["literal"]}


真实含义:
{item["meaning"]}


情绪:
{item.get("emotion","unknown")}

"""


        documents.append(

            KnowledgeDocument(

                id=item["id"],

                content=content.strip(),

                category="culture",

                source="chinese_culture",

                metadata={

                    "emotion":
                    item.get(
                        "emotion",
                        "unknown"
                    )

                }

            )

        )



    # ==============================
    # 3. 医疗场景知识
    # ==============================


    data = load_json_file(
        RAW_PATH/"scenario_medical.json"
    )


    for item in data:


        content=f"""

医疗场景关键词:
{",".join(item["keywords"])}


医学知识:
{item["knowledge"]}


回应策略:
{item["response_strategy"]}

"""


        documents.append(

            KnowledgeDocument(

                id=item["id"],

                content=content.strip(),

                category="medical",

                source="scenario_medical",

                metadata={

                    "scenario":
                    "hospital"

                }

            )

        )



    return documents