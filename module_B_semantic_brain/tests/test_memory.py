from memory.retriever import MemoryRetriever



memory=MemoryRetriever()



results=memory.search(
    "user001",
    "胃疼"
)



for r in results:

    print("================")

    print(r)
