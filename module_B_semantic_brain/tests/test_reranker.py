from rag.retriever import SignRetriever


retriever = SignRetriever()


results = retriever.search(
    "胃疼",
    top_k=3
)


for r in results:

    print("================")

    print(r.content)