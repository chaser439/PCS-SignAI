from memory.memory_store import MemoryStore



store=MemoryStore()



new_memory={

"user_id":"user001",

"sign_pattern":"药",

"meaning":"我要吃药",

"emotion":"neutral",

"frequency":1,

"confidence":0.8

}



store.add_memory(new_memory)



print("新增成功")



print(store.load())
