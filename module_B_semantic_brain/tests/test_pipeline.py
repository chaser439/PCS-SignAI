from pipeline.semantic_pipeline import SemanticPipeline



pipeline=SemanticPipeline()



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



result=pipeline.run(
    sign_input
)


print(result)
