"""
Semantic Reranker

融合:

1. keyword matching
2. intent matching
3. scenario matching
4. emotion matching
"""


def keyword_score(query, doc):

    score = 0


    keywords = [
        "胃",
        "疼",
        "痛",
        "医院",
        "医生",
        "药",
        "检查"
    ]


    for k in keywords:

        if k in query and k in doc.content:

            score += 1


    return score



def intent_score(target_intent, doc):

    if not target_intent:

        return 0


    if doc.metadata.get(
        "intent"
    ) == target_intent:

        return 1


    return 0



def scenario_score(target_scenario, doc):

    if not target_scenario:

        return 0


    if doc.metadata.get(
        "scenario"
    ) == target_scenario:

        return 1


    return 0



def emotion_score(target_emotion, doc):

    if not target_emotion:

        return 0


    if doc.metadata.get(
        "emotion"
    ) == target_emotion:

        return 1


    return 0



def rerank(
    query,
    documents,
    intent=None,
    scenario=None,
    emotion=None
):


    scored=[]


    for doc in documents:


        score = (

            0.6 * keyword_score(
                query,
                doc
            )

            +

            0.2 * intent_score(
                intent,
                doc
            )

            +

            0.1 * scenario_score(
                scenario,
                doc
            )

            +

            0.1 * emotion_score(
                emotion,
                doc
            )

        )


        scored.append(
            (
                score,
                doc
            )
        )


    scored.sort(
        key=lambda x:x[0],
        reverse=True
    )


    return [
        item[1]
        for item in scored
    ]