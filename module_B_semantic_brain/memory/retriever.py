from memory.memory_store import MemoryStore



class MemoryRetriever:


    def __init__(self):

        self.store = MemoryStore()



    def search(
        self,
        user_id,
        query
    ):


        memories = self.store.load()


        results=[]


        # 当前输入拆分
        query=query.replace("+","")



        for item in memories:


            if item["user_id"] != user_id:

                continue



            pattern=item["sign_pattern"]


            # 去掉 +
            pattern_clean=pattern.replace("+","")



            # 模糊匹配
            if pattern_clean in query:

                results.append(item)


            else:

                # 分词匹配
                keywords=pattern.split("+")


                matched=True


                for word in keywords:

                    if word not in query:

                        matched=False


                if matched:

                    results.append(item)



        return results
