from llm.llm_client import LLMClient

import json
import re




class SemanticReasoner:
    """
    语义推理器


    功能:

    1. 调用LLM
    2. 解析LLM输出
    3. 校验LLM输出
    4. 保证输出结构统一


    不负责:

        API调用

    """



    def __init__(self):

        self.client = LLMClient()



    # ======================================================
    # LLM输出解析
    # ======================================================


    def parse_response(
        self,
        response
    ):

        """
        兼容不同LLM返回格式

        支持:

        1. dict

        2. JSON字符串

        3. Markdown JSON代码块

        """


        # ------------------
        # 已经是dict
        # ------------------

        if isinstance(
            response,
            dict
        ):

            return response



        # ------------------
        # 字符串解析
        # ------------------

        if isinstance(
            response,
            str
        ):


            text = response.strip()



            # 去除markdown包裹

            text = re.sub(

                r"```json",

                "",

                text,

                flags=re.I

            )


            text = text.replace(
                "```",
                ""
            ).strip()



            try:

                return json.loads(
                    text
                )


            except Exception:

                pass



            # 尝试提取JSON部分

            match = re.search(

                r"\{.*\}",

                text,

                flags=re.S

            )


            if match:

                try:

                    return json.loads(
                        match.group()
                    )


                except Exception:

                    pass



        return {}





    # ======================================================
    # 输出结构校验
    # ======================================================


    def validate_result(
        self,
        data
    ):

        """
        校验LLM输出结构


        保证:

        {
            intent,
            expression,
            emotion,
            ambiguity,
            confidence
        }


        """


        default = {


            "intent":

            "unknown",



            "expression":

            "用户表达了一种需求",



            "emotion":

            "neutral",



            "ambiguity":

            "无明显歧义",



            "confidence":

            0.0

        }



        # ==================================================
        # 第一步:
        # 解析不同格式
        # ==================================================

        data = self.parse_response(
            data
        )



        # 防止LLM返回异常类型


        if not isinstance(
            data,
            dict
        ):


            return default




        # ==================================================
        # 第二步:
        # 补充缺失字段
        # ==================================================


        for key,value in default.items():


            if key not in data:


                data[key] = value





        # ==================================================
        # 第三步:
        # confidence类型统一
        # ==================================================


        try:


            confidence = data["confidence"]



            # 字符串百分比

            if isinstance(
                confidence,
                str
            ):


                confidence = (
                    confidence
                    .replace(
                        "%",
                        ""
                    )
                )



            confidence = float(
                confidence
            )



            # 如果LLM返回93

            if confidence > 1:


                confidence /= 100




            # 限制范围


            if confidence < 0:


                confidence = 0.0



            if confidence > 1:


                confidence = 1.0




            data["confidence"] = confidence



        except Exception:


            data["confidence"] = 0.0





        return data





    # ======================================================
    # LLM推理入口
    # ======================================================


    def reason(
        self,
        prompt
    ):


        """
        执行语义推理


        输入:

            prompt


        输出:

            标准dict


        """


        response = self.client.generate(

            prompt

        )



        result = self.validate_result(

            response

        )



        return result