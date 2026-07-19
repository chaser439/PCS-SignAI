from fastapi import FastAPI

from pipeline.semantic_pipeline import SemanticPipeline


app = FastAPI(

    title="PCS-SignAI Semantic Brain"

)



pipeline = SemanticPipeline()



@app.get("/")
def root():

    return {

        "status":
        "Semantic Brain Running"

    }




@app.post("/semantic-understand")
def semantic_understand(data:dict):


    result = pipeline.run(
        data
    )


    return result
