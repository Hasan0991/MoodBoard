import os
import base64
from pathlib import Path
from uuid import uuid4
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

IMAGE_DIR = Path(__file__).resolve().parent.parent / "generated_images"
IMAGE_DIR.mkdir(exist_ok=True)


def generate_image(prompt: str):

    img = client.images.generate(
        model="gpt-image-2.5-sunburst",
        prompt=prompt
    )

    image_base64 = img.data[0].b64_json
    image_bytes = base64.b64decode(image_base64)

    filename = f"{uuid4().hex}.png"
    image_path = IMAGE_DIR / filename

    with open(image_path, "wb") as image_file:
        image_file.write(image_bytes)

    return filename
