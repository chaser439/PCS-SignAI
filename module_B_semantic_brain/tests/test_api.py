import requests
import json



url = "http://127.0.0.1:8000/semantic/analyze"



payload = {

    "user_id": "user001",

    "sign_sequence": [

        "胃",

        "疼"

    ],

    "emotion": {

        "type": "pain",

        "confidence": 0.91

    }

}



response = requests.post(

    url,

    json=payload

)



print("HTTP状态:")

print(response.status_code)



print("================")

print("返回结果:")

print(
    json.dumps(
        response.json(),
        ensure_ascii=False,
        indent=4
    )
)