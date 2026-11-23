# Interior Design AI

Prose word count: 506 (excluding headings, this line, and setup commands/code).

## Status

A local prototype for creating AI-assisted room concepts. Choose a room and style, set three preference sliders, optionally ask AI to interpret a description, and generate an image. The browser keeps a temporary generation history and can compare the latest two results. Image generation and description analysis require the OpenAI API and a valid key. History is session-only; there is no user account, database, or deployment configuration.

## Stack

- Python, FastAPI, and Pydantic provide the API and request validation; vanilla HTML, CSS, and JavaScript provide the interface.
- The OpenAI API uses `gpt-4o-mini` to interpret descriptions and the image model ID `gpt-image-2.5-sunburst` to generate room images. `python-dotenv` loads a local `.env` file.
- The image model ID and hosting/deployment approach have not been independently verified or finalized.

## Run locally

Requires Python 3.10+ and an OpenAI API key. From the project root, install packages from `requirements.txt` and set your own key (or put `OPENAI_API_KEY=your-key` in a root `.env` file):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
$env:OPENAI_API_KEY = "your-key"
uvicorn backend.main:app --reload
```

In a second terminal at the project root, serve the frontend:

```powershell
python -m http.server 5500 --directory frontend
```

Open `http://localhost:5500`. The frontend calls the API at `http://127.0.0.1:8000`; generated PNGs are saved under `generated_images/`. 

## Development record

Development progressed through these stages:

- Set up the FastAPI backend, connected OpenAI image generation, and added endpoints for submitting design preferences and requesting generated images.
- Started with preference sliders whose values were converted into a design prompt.
- Added a text description input and AI analysis, then combined it with the slider-based flow. Users can provide a description, adjust priorities, or keep the sliders at their defaults; input validation was revised for these paths.
- Added a session-only gallery and a comparison of the latest and previous generated images.

Manually tested the frontend against six scenarios:

1. **Cosiness dominant:** 20/80/0 preferences produce a warm, cosy interior.
2. **Minimalism dominant:** 100/0/0 preferences produce a minimalist interior.
3. **Colourfulness dominant:** 10/0/90 preferences produce a colourful interior with bold colours.
4. **Combined priorities:** 60/80/0 preferences produce a warm, relatively minimalist Scandinavian bedroom.
5. **Preserve preferences:** starting at 70/40/20, changing an unrelated detail leaves slider values unchanged.
6. **Manual generation:** 90/10/30 generates an image without a description or AI analysis.

## AI Assistance and Individual Contribution

This project was developed individually. My primary focus was backend development, including the FastAPI architecture, preference interpretation, prompt construction, API integration and AI description interpretation. I also worked on the frontend, including integrating the interface with the backend and implementing the user interaction flow.

ChatGPT was used as a supporting tool during development and report preparation. I used it to discuss implementation approaches, understand technical issues, debug errors and improve documentation. Suggestions were reviewed and adapted to the actual project rather than accepted automatically.

I remained responsible for the system architecture, implementation decisions and final results. I checked the application by running it, testing its API functionality and completing six functional test scenarios.

## Additional files
Python dependencies are listed in [`requirements.txt`](requirements.txt).

Generated image outputs are in `generated_images/`. No accompanying report, documentation bundle, or ZIP file is included.
