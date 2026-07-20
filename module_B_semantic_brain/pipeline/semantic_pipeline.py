from rag.retriever import Retriever
from memory.retriever import MemoryRetriever
from prompts.prompt_builder import PromptBuilder
from llm.reasoning import SemanticReasoner
from schemas.semantic_result import SemanticResult



class SemanticPipeline:


    def __init__(self):

        self.retriever = Retriever()

        self.memory = MemoryRetriever()

        self.prompt_builder = PromptBuilder()

        self.reasoner = SemanticReasoner()



    def infer_context(
        self,
        query,
        memory_results
    ):

        """
        根据输入和历史信息
        生成检索上下文

        用于RAG rerank
        """

        context = {

            "intent": None,

            "scenario": None,

            "emotion": None

        }


        # ===== 医疗场景 =====

        medical_words = [

            "疼",
            "痛",
            "医院",
            "医生",
            "药",
            "检查"

        ]


        if any(
            w in query
            for w in medical_words
        ):


            context["scenario"] = "hospital"

            context["emotion"] = "pain"



            if (
                "医院" in query
                or "医生" in query
                or "检查" in query
            ):

                context["intent"] = (
                    "seek_medical_help"
                )

            else:

                context["intent"] = (
                    "describe_symptom"
                )



        # ===== Memory增强 =====


        for item in memory_results:


            if item.get(
                "confidence",
                0
            ) > 0.8:


                if (
                    "医院"
                    in item.get(
                        "meaning",
                        ""
                    )
                ):

                    context["intent"] = (
                        "seek_medical_help"
                    )



        return context




    def run(
        self,
        sign_input
    ):


        user_id = sign_input["user_id"]


        # ======================
        # 1. 输入处理
        # ======================


        query = "".join(
            sign_input["sign_sequence"]
        )



        # ======================
        # 2. Memory检索
        # ======================


        memory_results = self.memory.search(

            user_id,

            query

        )



        # ======================
        # 3. 生成动态检索条件
        # ======================


        semantic_context = self.infer_context(

            query,

            memory_results

        )



        # ======================
        # 4. RAG检索
        # ======================


        knowledge_docs = self.retriever.search(

            query,

            top_k=3,

            intent=
            semantic_context["intent"],

            scenario=
            semantic_context["scenario"],

            emotion=
            semantic_context["emotion"]

        )



        knowledge_text = "\n".join(

            [

                d.content

                for d in knowledge_docs

            ]

        )



        # ======================
        # 5. Memory文本
        # ======================


        memory_text = "\n".join(

            [

                str(m)

                for m in memory_results

            ]

        )



        # ======================
        # 6. Prompt
        # ======================


        prompt = self.prompt_builder.build(

            sign_input,

            knowledge_text,

            memory_text

        )



        # ======================
        # 7. DeepSeek推理
        # ======================


        response = self.reasoner.reason(

            prompt

        )



        # ======================
        # 8. 输出
        # ======================


        return {

            "schema_version": "1.0",

            "video_id":
                sign_input.get(
                    "video_id",
                    ""
                ),

            "user_id":
                user_id,


            "status":
                "ok",


            "input_sign_sequence":
                sign_input["sign_sequence"],


            "rag_evidence":
                [
                    d.content
                    for d in knowledge_docs
                ],


            "memory_evidence":
                memory_results,


            "semantic_result":
                {

                    "expression":
                        response.get(
                            "expression",
                            ""
                        ),


                    "intent":
                        response.get(
                            "intent",
                            "unknown"
                        ),


                    "emotion":
                        response.get(
                            "emotion",
                            "neutral"
                        ),


                    "confidence":
                        response.get(
                            "confidence",
                            0
                        )

                }

        }
