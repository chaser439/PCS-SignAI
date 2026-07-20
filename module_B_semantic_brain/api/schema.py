from typing import List, Optional
from pydantic import BaseModel


class SignInput(BaseModel):
    """
    Module A -> Module B
    对齐 schemas/sign_output_schema.json
    """

    schema_version: str = "1.0"


    video_id: Optional[str] = None


    user_id: Optional[str] = None


    status: str = "ok"


    source_path: Optional[str] = None


    sign_sequence: List[str]


    overall_confidence: float = 1.0


    # 非手语信息
    # 对应 Module A non_manual_cues

    face_expression: Optional[str] = None


    body_pose: Optional[str] = None


    context: Optional[str] = None



class SemanticOutput(BaseModel):
    """
    Module B -> Module C
    """

    user_id: Optional[str] = None

    semantic: str

    emotion: str

    intent: str

    confidence: float

    memory_used: bool