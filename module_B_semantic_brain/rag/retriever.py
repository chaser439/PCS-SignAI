import json
from pathlib import Path

import faiss
from sentence_transformers import SentenceTransformer

from knowledge.schema import KnowledgeDocument
from rag.reranker import rerank



class SignRetriever:
    """
    手语知识库检索器

    功能:

    输入:
        用户手语语义描述

    输出:
        Top-K相关知识

    流程:

    Query
      |
      ↓
    BGE Embedding
      |
      ↓
    FAISS Dense Retrieval
      |
      ↓
    Multi-factor Rerank
      |
      ↓
    Top-K
    """



    def __init__(self):


        BASE_DIR = Path(__file__).resolve().parent.parent


        self.index_path = (
            BASE_DIR
            /
            "vector_store"
            /
            "sign_brain.index"
        )


        self.meta_path = (
            BASE_DIR
            /
            "vector_store"
            /
            "metadata.json"
        )


        print("Loading FAISS index...")


        self.index = faiss.read_index(
            str(self.index_path)
        )


        print(
            "Index size:",
            self.index.ntotal
        )



        print(
            "Loading embedding model..."
        )


        self.model = SentenceTransformer(
            "BAAI/bge-small-zh"
        )



        with open(
            self.meta_path,
            "r",
            encoding="utf-8"
        ) as f:

            self.metadata = json.load(f)




    def search(
        self,
        query,
        top_k=3,

        intent=None,
        scenario=None,
        emotion=None

    ):

        """
        语义检索 + 多因素重排序


        Args:

            query:
                用户输入


            top_k:
                返回数量


            intent:
                用户意图


            scenario:
                场景


            emotion:
                情绪


        """



        # =====================
        # Step 1
        # Dense Retrieval
        # =====================


        vector = self.model.encode(

            [query],

            normalize_embeddings=True

        )



        candidate_k = min(

            max(top_k * 3, 10),

            self.index.ntotal

        )



        scores, indexes = self.index.search(

            vector,

            candidate_k

        )



        results=[]



        for score, idx in zip(

            scores[0],

            indexes[0]

        ):


            # FAISS异常索引过滤

            if idx == -1:

                continue



            item = self.metadata[idx]



            metadata = item["metadata"].copy()



            # =====================
            # 保存FAISS语义分数
            # 给reranker使用
            # =====================


            metadata[

                "similarity_score"

            ] = float(score)



            doc = KnowledgeDocument(


                id=item["id"],


                content=item["content"],


                category=item["category"],


                source=item["source"],


                metadata=metadata

            )


            results.append(doc)




        # =====================
        # Step 2
        # Multi-factor Reranking
        # =====================


        results = rerank(

            query,

            results,

            intent=intent,

            scenario=scenario,

            emotion=emotion

        )



        return results[:top_k]




Retriever = SignRetriever