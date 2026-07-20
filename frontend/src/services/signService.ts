import type {
  SignResult,
  BuiltInCase
} from './serviceTypes'


const MODULE_A_URL =
  "http://127.0.0.1:9001/sign/analyze"



export const signService = {


async analyze(
 input:{
  caseId?: BuiltInCase['id']
  file?:File
  userId:string
 }
):Promise<SignResult>{


 if(!input.file){

   throw new Error(
    "未上传视频"
   )

 }


 const formData =
   new FormData()


 formData.append(
  "file",
  input.file
 )


 formData.append(
  "user_id",
  input.userId
 )


 const response =
 await fetch(
   MODULE_A_URL,
   {
    method:"POST",
    body:formData
   }
 )


 if(!response.ok){

   throw new Error(
    `Module A error ${response.status}`
   )

 }


 return await response.json()


}


}