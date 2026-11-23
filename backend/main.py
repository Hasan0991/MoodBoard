import traceback

from fastapi import FastAPI, HTTPException, Path
from fastapi.staticfiles import StaticFiles
from fastapi import Request

from backend.priority_interpreter import calculate_priority, interpret_priorities
from backend.prompt_builder import build_design_prompt
from backend.schemas import DesignPreferences, PriorityInterpretation
from pathlib import Path
from backend.image_generator import  generate_image as generate_image_file
from fastapi.middleware.cors import CORSMiddleware

from backend.description_interpreter import interpret_description

app = FastAPI(title="Interior Design AI")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

IMAGE_DIR = Path(__file__).resolve().parent.parent / "generated_images"
IMAGE_DIR.mkdir(exist_ok=True)

app.mount(
    "/generated-images",
    StaticFiles(directory=IMAGE_DIR),
    name="generated-images"
)


@app.get("/")
async def root():
    return {"message": "Welcome to the Interior Design AI API!"}

@app.post("/preferences")
async def receive_preferences(data: DesignPreferences):
    return {
        "message": "Preferences received successfully",
        "preferences": data
    }

@app.post("/calculate-priority")
async def calculate_priority_endpoint(data: PriorityInterpretation):
    preferences_dict = data.dict()
    weights = calculate_priority(preferences_dict)
    interpretation = interpret_priorities(weights)
    return {
        "weights": weights,
        "interpretation": interpretation
    }

@app.post("/generate-design-prompt")
async def generate_design_prompt(data: DesignPreferences):
    preferences_dict = {
        "minimalism": data.minimalism,
        "cosiness": data.cosiness,
        "colourfulness": data.colourfulness
    }
    
    weights = calculate_priority(preferences_dict)
    interpretation = interpret_priorities(weights)

    prompt = build_design_prompt(data.room_type, data.style, interpretation)

    return {
        "prompt": prompt
    }

@app.post("/generate-image")
async def generate_image(request: Request, data: DesignPreferences):
    preferences_dict = {
        "minimalism": data.minimalism,
        "cosiness": data.cosiness,
        "colourfulness": data.colourfulness
    }
    
    weights = calculate_priority(preferences_dict)
    interpretation = interpret_priorities(weights)
    ai_prompt_interpretation = interpret_priorities(weights)

    prompt = build_design_prompt(data.room_type, data.style, interpretation, data.description)

    filename = generate_image_file(prompt)

    image_url = str(
        request.base_url
    ) + f"generated-images/{filename}"


    return {
        "message": "Design generated successfully",
        "filename": filename,
        "image_url": image_url,
        "prompt": prompt,
        "interpretation": interpretation,
        "ai_prompt_interpretation": ai_prompt_interpretation
    }

@app.post("/interpret-description")
async def interpret_description_endpoint(data:dict):
    description = data.get("description", "")
    if not description:
        raise HTTPException(status_code=400, detail="Description is required")

    try:
        current_preferences =data.get("current_preferences", {})
        result =  interpret_description(description,current_preferences)
        
        preferences = result["preferences"]

        weights = calculate_priority(preferences)

        interpretation = interpret_priorities(weights)

        return {
            "preferences": preferences,
            "weights": weights,
            "interpretation": interpretation,
            "detected_details": result["detected_details"],
            "explanation": result["explanation"]
        }
    except ValueError as error:
        raise HTTPException(
            status_code=422,
            detail=str(error)
        )

    except Exception as error:
        traceback.print_exc()
        raise HTTPException(
            status_code=502,
            detail=str(error)
            )   