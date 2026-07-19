from rag.retriever import SignRetriever



retriever=SignRetriever()



results=retriever.search(
    "我的胃很难受",
    top_k=3
)


for r in results:

    print("================")

    print(
        "score:",
        r["score"]
    )

    print(
        r["knowledge"]
    )