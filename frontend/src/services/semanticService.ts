import type {
  SemanticResult,
  SignResult
} from './serviceTypes'


const SEMANTIC_API_URL =
  'http://127.0.0.1:8000/semantic/analyze'



export const semanticService = {


  async understand(
    signResult: SignResult,
  ): Promise<SemanticResult> {


    try {


      const response =
        await fetch(
          SEMANTIC_API_URL,
          {
            method: 'POST',

            headers:{
              'Content-Type':
                'application/json'
            },


            body:JSON.stringify({

              schema_version:"1.0",

              video_id:
                signResult.video_id,


              user_id:
                signResult.user_id,


              status:
                signResult.status,


              source_path:
                signResult.source_path,


              sign_sequence:
                signResult.sign_sequence,


              overall_confidence:
                signResult.overall_confidence

            })

          }
        )


      if(!response.ok){

        throw new Error(
          `Module B error:${response.status}`
        )

      }



      const data =
        await response.json()



      const semantic =
        data.semantic_result ?? data

      const confidence =
        semantic.confidence
        ?? semantic.confidence_score
        ?? 0



      /**
       * Module B格式
       *
       * {
       * expression
       * intent
       * emotion
       * confidence
       * }
       *
       *
       * 转换为前端格式
       */


      return {


        schema_version:"1.0",


        video_id:
          signResult.video_id,


        user_id:
          signResult.user_id,


        status:"ok",


        input_sign_sequence:
          signResult.sign_sequence,


        rag_hits:
          [],


        memory_hits:
          (data.memory_evidence ?? []).map(
            (item:any)=>({
              id:item.sign_pattern ?? "",
              score:item.confidence ?? 0,
              meaning:item.meaning ?? ""
            })
          ),


        emotion:{
          label:
            semantic.emotion?.label
            ??
            semantic.emotion
            ??
            semantic.emotion_label
            ??
            "unknown",

        score:
          semantic.emotion?.score
          ??
        confidence
        },


        normalized_text:
          semantic.expression
          ?? semantic.normalized_text
          ?? "",


        inferred_intent:
          semantic.intent
          ?? semantic.inferred_intent
          ?? "unknown",


        evidence:
          data.rag_evidence ?? [],


        confidence_breakdown:{

          sign_conf:
            signResult.overall_confidence,

          rag_conf:
            confidence,

          memory_conf:
            0,

          llm_conf:
            confidence

        },


        overall_confidence:
          confidence,


        error:null

      }



    }catch(error){

      console.error(
        "Module B调用失败",
      error
    )


    return {

    schema_version:"1.0",

    video_id:
      signResult.video_id,

    user_id:
      signResult.user_id,

    status:"error",

    input_sign_sequence:
      signResult.sign_sequence,

    rag_hits:[],

    memory_hits:[],

    emotion:{
      label:"unknown",
      score:0
    },

    normalized_text:"",

    inferred_intent:
      "Module B调用失败",

    evidence:[],

    confidence_breakdown:{
      sign_conf:
        signResult.overall_confidence,

      rag_conf:0,

      memory_conf:0,

      llm_conf:0
    },

    overall_confidence:0,

    error:{
      code:"MODULE_B_ERROR",
      message:String(error)
    }

    }

  }


  }

}
