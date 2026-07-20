from knowledge.loader import load_all_documents


docs = load_all_documents()


print("知识数量:", len(docs))


for d in docs[:3]:
    print("----------------")
    print(d)