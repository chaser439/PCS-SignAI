from dataclasses import dataclass
from typing import Dict


@dataclass
class UserMemory:


    user_id:str


    sign_pattern:str


    meaning:str


    emotion:str


    frequency:int


    confidence:float


    metadata:Dict
