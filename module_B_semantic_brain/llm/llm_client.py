import os
import json

from dotenv import load_dotenv
from openai import OpenAI


load_dotenv()



class LLMClient:
    """
    LLM API客户端

    功能:

    1. 调用DeepSeek API
    2. 管理API配置
    3. 返回结构化dict结果

    注意:
    本模块只负责:
        API调用

    不负责:
        业务逻辑
        字段校验

    """



    def __init__(
        self,
        mode="deepseek"
    ):


        self.mode = mode


        # =====================
        # DeepSeek模式
        # =====================

        if self.mode == "deepseek":


            api_key = os.getenv(
                "DEEPSEEK_API_KEY"
            )


            if not api_key:


                raise ValueError(
                    "Missing DEEPSEEK_API_KEY"
                )


            self.client = OpenAI(

                api_key=api_key,

                base_url=
                "https://api.deepseek.com"

            )



    def generate(
        self,
        prompt
    ):

        """
        根据prompt生成结果

        返回:
            dict

        """



        if self.mode == "deepseek":


            return self.call_deepseek(
                prompt
            )


        elif self.mode == "demo":


            return self.demo_response(
                prompt
            )


        else:


            raise ValueError(

                f"Unsupported LLM mode:{self.mode}"

            )





    def call_deepseek(
        self,
        prompt
    ):


        """
        调用DeepSeek Chat API

        返回:
            JSON dict

        """


        try:


            response = self.client.chat.completions.create(

                model="deepseek-chat",


                messages=[


                    {

                        "role":
                        "system",


                        "content":
                        """
你是一名中文手语语义理解专家。

你的任务是根据:
- 用户手语输入
- 知识库信息
- 用户历史表达

推断用户真实意图。

必须输出合法JSON。
"""

                    },


                    {

                        "role":
                        "user",


                        "content":
                        prompt

                    }


                ],


                temperature=0.2,


                response_format={

                    "type":
                    "json_object"

                }

            )



            content = (
                response
                .choices[0]
                .message
                .content
            )



            return json.loads(
                content
            )



        except Exception as e:


            print(
                "DeepSeek API error:",
                e
            )


            return {

                "intent":
                "unknown",


                "expression":
                "",


                "emotion":
                "unknown",


                "ambiguity":
                "模型调用失败",


                "confidence":
                0.0

            }






    def demo_response(
        self,
        prompt
    ):

        """
        本地Demo模式

        用于:
        无API环境测试
        """



        return {


            "intent":
            "seek_medical_help",


            "expression":
            "我身体不舒服，需要医疗帮助",


            "emotion":
            "pain",


            "ambiguity":
            "需要进一步确认具体症状",


            "confidence":
            0.5

        }