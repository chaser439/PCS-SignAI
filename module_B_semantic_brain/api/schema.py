from typing import List, Optional
from pydantic import BaseModel


class SignInput(BaseModel):
    """
    Module A -> Module B
    """

    user_id: str

    sign_sequence: List[str]

    face_expression: Optional[str] = None

    body_pose: Optional[str] = None

    context: Optional[str] = None



class SemanticOutput(BaseModel):
    """
    Module B -> Module C
    """

    user_id: str

    semantic: str

    emotion: str

    intent: str

    confidence: float

    memory_used: bool