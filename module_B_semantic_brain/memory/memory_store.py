import json
from pathlib import Path


class MemoryStore:


    def __init__(self):

        self.path = (
            Path(__file__).parent
            /
            "user_memory.json"
        )


        if not self.path.exists():

            self.path.write_text(
                "[]",
                encoding="utf-8"
            )



    def load(self):

        with open(
            self.path,
            "r",
            encoding="utf-8"
        ) as f:

            return json.load(f)



    def save(
        self,
        memories
    ):

        with open(
            self.path,
            "w",
            encoding="utf-8"
        ) as f:

            json.dump(
                memories,
                f,
                ensure_ascii=False,
                indent=2
            )



    def add_memory(
        self,
        memory
    ):

        memories=self.load()


        memories.append(memory)


        self.save(memories)
