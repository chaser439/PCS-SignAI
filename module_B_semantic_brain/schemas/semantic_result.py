from dataclasses import dataclass
from typing import List, Dict


@dataclass
class SemanticResult:


    user_id:str


    input_signs:List[str]


    rag_evidence:List[str]


    memory_evidence:List[Dict]


    result:Dict



    def to_dict(self):

        return {

            "user_id":
            self.user_id,


            "input_signs":
            self.input_signs,


            "rag_evidence":
            self.rag_evidence,


            "memory_evidence":
            self.memory_evidence,


            "semantic_result":
            self.result

        }