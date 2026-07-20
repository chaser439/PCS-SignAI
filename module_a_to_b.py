import requests


MODULE_B_URL = (
    "http://127.0.0.1:8000/semantic/analyze"
)


def call_module_b(
        sign_output
):


    request_data = {


        "user_id":
            sign_output.get(
                "user_id",
                "unknown"
            ),


        "sign_sequence":
            sign_output.get(
                "sign_sequence",
                []
            ),


        "emotion":
            sign_output.get(
                "non_manual_cues"
            )

    }


    response=requests.post(

        MODULE_B_URL,

        json=request_data

    )


    return response.json()