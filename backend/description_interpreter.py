
import json
from openai import OpenAI

client = OpenAI()


def interpret_description(description: str, current_preferences: dict = None) -> dict:

    system_prompt = """
    You are an AI interior design preference interpreter.

    Your task is to analyse a user's natural-language description
    of their ideal room.

    Identify the relative importance of exactly three design
    preferences:

    1. minimalism
    2. cosiness
    3. colourfulness

    Assign each preference an integer importance score
    between 0 and 100.

    IMPORTANT RULES:

    - Analyse the meaning and context of the description.
    - Do not simply count how often a word appears.
    - Consider explicit statements of importance.
    - Consider contrasts and qualifications.
    - If a user says "I like minimalism, but cosiness is
      much more important", cosiness must receive a higher score.
    - Do not invent preferences that the user did not express.
    - If a preference is not mentioned, do not automatically
      assume it is important.
    - If the description is ambiguous, explain this in
      the interpretation.
    - Do not claim certainty when the user's intention
      is unclear.

    Also extract additional design details, such as:
    colours, materials, lighting, furniture and atmosphere.

    Return ONLY valid JSON with this structure:

    {
        "preferences": {
            "minimalism": 0,
            "cosiness": 0,
            "colourfulness": 0
        },
        "detected_details": [],
        "explanation": ""
    }
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": json.dumps({
                    "description": description,
                    "current_preferences": current_preferences
                })
            }
        ],
        temperature=0.2
    )

    result = json.loads(
        response.choices[0].message.content
    )

    preferences = result["preferences"]

    required_keys = {
        "minimalism",
        "cosiness",
        "colourfulness"
    }

    if set(preferences.keys()) != required_keys:
        raise ValueError("Invalid preference structure")

    for value in preferences.values():
        if (
            isinstance(value, bool)
            or not isinstance(value, int)
            or not 0 <= value <= 100
        ):
            raise ValueError("Invalid preference score")

    if sum(preferences.values()) == 0:
        raise ValueError("At least one preference must be positive")

    if not isinstance(result["detected_details"], list):
        raise ValueError("Invalid detected details")

    if not all(
        isinstance(detail, str)
        for detail in result["detected_details"]
    ):
        raise ValueError("Invalid design detail")

    if not isinstance(result["explanation"], str):
        raise ValueError("Invalid explanation")

    return result
