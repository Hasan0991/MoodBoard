
def build_design_prompt(room_type, style, interpretation, description=None):

    prompt = f"""
    Generate an interior design image of a {room_type}
    in {style} style.
    """

    if description:
        prompt += f"""

        User's original description:
        {description}

        Use the user's description as additional design guidance.
        Preserve the requested furniture, materials, colours,
        lighting and other specific details.
        """

    DESCRIPTIONS = {
        "minimalism": "simple furniture, clean lines and minimal decoration",
        "cosiness": "warm lighting, comfortable furniture and soft textures",
        "colourfulness": "vibrant colours and colourful decorative accents"
    }

    prompt += "\nDesign priorities:\n"

    for criterion, details in interpretation.items():
        weight = details["weight"]
        criterion_description = DESCRIPTIONS[criterion]

        prompt += (
            f"\n- {criterion} ({weight}%): "
            f"{criterion_description}"
        )

    prompt += """

    Balance the design according to the relative importance
    of these preferences. The highest-priority criteria
    should have the strongest influence on the overall design.

    Produce a realistic, visually coherent interior design.
    """

    return prompt
