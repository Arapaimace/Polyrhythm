# server/src/main.py
from fastapi import FastAPI, File, UploadFile
from fastapi.staticfiles import StaticFiles
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from .part import extract_polyrhythm
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware


load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

print(SUPABASE_KEY, SUPABASE_URL)
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase URL or service role key not set in environment variables!")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:5173", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SAMPLES_DIR = "server/src/samples"
app.mount("/samples", StaticFiles(directory=SAMPLES_DIR), name="samples")

current_file_path = None


@app.get("/")
async def root():
    return {"status": "ok"}


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    global current_file_path

    contents = await file.read()
    input_path = f"{SAMPLES_DIR}/{file.filename}"

    with open(input_path, "wb") as f:
        f.write(contents)

    current_file_path = input_path

    return {"filename": file.filename}


@app.get("/parse")
async def parse_score(start_measure: int = 1, end_measure: int = 2):
    global current_file_path

    if not current_file_path:
        return {"error": "No file uploaded yet"}

    output_xml = f"{SAMPLES_DIR}/output.musicxml"
    output_midi = f"{SAMPLES_DIR}/output.mid"
    output_png = f"{SAMPLES_DIR}/output.png"

    image_path, notes, left, right = await run_in_threadpool(
        extract_polyrhythm,
        current_file_path,
        output_xml,
        output_midi,
        output_png,
        start_measure,
        end_measure,
    )

    return {
        "image_path": "/samples/output.png",
        "notes": notes,
        "left": left,
        "right": right,
    }
