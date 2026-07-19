from prompts.prompt_builder import PromptBuilder



builder=PromptBuilder()



sign_input={

"user_id":"user001",

"sign_sequence":[
"胃",
"疼"
],

"emotion":{
"type":"pain",
"confidence":0.91
}

}



knowledge="""

胃疼:
表示身体不适，
可能需要医疗帮助

"""


memory="""

用户历史:

胃+疼:
我要去医院检查胃部问题

"""



prompt=builder.build(
    sign_input,
    knowledge,
    memory
)



print(prompt)