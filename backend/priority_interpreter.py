def calculate_priority(preferences):
    """
    Calculate the priority of a given data item based on its attributes.

    Args:
        preferences (dict): A dictionary containing the preference weights for each attribute.

    Returns:
        int: The calculated priority value.
    """
    # Example priority calculation logic
    total=sum(preferences.values())

    if total==0:
        raise ValueError("At least one preference weight must be greater than zero.")

    weights={}

    for criterion,values in preferences.items():
        weights[criterion]=round((values/total)*100,1)
    return weights

def interpret_priorities(weights):
    """
    Convert numerical weights into understandable descriptions.
    """

    interpretation = {}

    for criterion, weight in weights.items():
        if weight >= 45:
            description = "Main priority"
        elif weight >= 25:
            description = "Secondary priority"
        else:
            description = "Lower priority"

        interpretation[criterion] = {
            "weight": weight,
            "description": description
        }

    return interpretation
