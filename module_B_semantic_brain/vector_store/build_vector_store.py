import json
from pathlib import Path

import faiss
from sentence_transformers import SentenceTransformer

from knowledge.loader import load_all_documents


# =========================
# 当前文件路径
# =========================

BASE_DIR = Path(__file__).resolve().parent


BASE_DIR.mkdir(
    exist_ok=True
)


INDEX_PATH = BASE_DIR / "sign_brain.index"

META_PATH = BASE_DIR / "metadata.json"



# =========================
# 加载中文Embedding模型
# =========================

print("Loading embedding model...")


model = SentenceTransformer(
    "BAAI/bge-small-zh"
)



# =========================
# 加载知识文档
# =========================


print("Loading knowledge documents...")


documents = load_all_documents()


texts = [
    doc.content
    for doc in documents
]


print(
    "Documents loaded:",
    len(texts)
)



# =========================
# 文本Embedding
# =========================


print("Encoding texts...")


embeddings = model.encode(
    texts,
    normalize_embeddings=True
)



print(
    "Embedding shape:",
    embeddings.shape
)



# =========================
# 创建FAISS索引
# =========================


dimension = embeddings.shape[1]


index = faiss.IndexFlatIP(
    dimension
)


index.add(
    embeddings
)



print(
    "Vectors added:",
    index.ntotal
)



# =========================
# 保存FAISS
# =========================


print("Saving index to:")
print(INDEX_PATH)

print("Vector store exists:")
print(BASE_DIR.exists())


BASE_DIR.mkdir(
    parents=True,
    exist_ok=True
)


faiss.write_index(
    index,
    str(INDEX_PATH)
)
# =========================
# 保存文本映射
# =========================


metadata=[]


for doc in documents:

    metadata.append(
        {
            "id":doc.id,

            "content":doc.content,

            "category":doc.category,

            "source":doc.source,

            "metadata":doc.metadata
        }
    )



with open(
    META_PATH,
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        metadata,
        f,
        ensure_ascii=False,
        indent=2
    )



print("====================")
print("Vector store built!")
print("====================")