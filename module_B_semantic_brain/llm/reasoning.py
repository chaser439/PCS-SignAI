from llm.llm_client import LLMClient




class SemanticReasoner:
    """
    语义推理器


    功能:

    1. 调用LLM
    2. 校验LLM输出
    3. 保证输出结构统一


    不负责:
        API调用

    """



    def __init__(self):


        self.client = LLMClient()





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
            "",


            "emotion":
            "unknown",


            "ambiguity":
            "无明显歧义",


            "confidence":
            0.0

        }




        # 防止LLM返回异常类型


        if not isinstance(
            data,
            dict
        ):


            return default




        # 补充缺失字段


        for key,value in default.items():


            if key not in data:


                data[key] = value





        # confidence类型统一


        try:


            confidence = float(

                data["confidence"]

            )


            # 限制范围


            if confidence < 0:


                confidence = 0.0


            if confidence > 1:


                confidence = 1.0



            data["confidence"] = confidence



        except Exception:


            data["confidence"] = 0.0




        return data





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