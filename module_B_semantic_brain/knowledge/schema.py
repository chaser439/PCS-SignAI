from dataclasses import dataclass
from typing import Dict


@dataclass
class KnowledgeDocument:
    """
    Module B统一知识文档结构
    """

    id: str

    content: str

    category: str

    source: str

    metadata: Dict