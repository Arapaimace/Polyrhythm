from pathlib import Path
from uuid import uuid4
import os
import logging

from dotenv import load_dotenv

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool

from .part import extract_polyrhythm



load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent

SAMPLES_DIR = BASE_DIR / "samples"

SAMPLES_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {
    ".mscz",
    ".musicxml",
    ".xml",
}

MAX_FILE_SIZE = 20 * 1024 * 1024  



app = FastAPI(
    title="Polyrhythm Extraction API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount(
    "/samples",
    StaticFiles(directory=str(SAMPLES_DIR)),
    name="samples",
)


current_file_path: Path | None = None



@app.get("/")
async def root():
    return {
        "status": "ok",
        "message": "Polyrhythm extraction API is running.",
    }


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    global current_file_path

    try:
        if not file.filename:
            raise HTTPException(
                status_code=400,
                detail="No filename provided.",
            )

        extension = Path(file.filename).suffix.lower()

        if extension not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file type. Upload MSCZ, MusicXML, or XML.",
            )

        contents = await file.read(MAX_FILE_SIZE + 1)

        if not contents:
            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty.",
            )

        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail="File exceeds the 20 MB upload limit.",
            )

        filename = f"{uuid4().hex}{extension}"

        input_path = SAMPLES_DIR / filename

        with open(input_path, "wb") as output_file:
            output_file.write(contents)

        current_file_path = input_path

        logger.info("File uploaded successfully: %s", filename)

        return {
            "message": "File uploaded successfully.",
            "filename": filename,
        }

    except HTTPException:
        raise

    except Exception as e:
        logger.exception("File upload failed")

        raise HTTPException(
            status_code=500,
            detail=f"File upload failed: {str(e)}",
        )

    finally:
        await file.close()



@app.get("/parse")
async def parse_score(
    start_measure: int = 1,
    end_measure: int = 2,
):
    global current_file_path

    if current_file_path is None:
        raise HTTPException(
            status_code=400,
            detail="No file uploaded yet.",
        )

    if not current_file_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Uploaded file could not be found.",
        )

    if start_measure < 1:
        raise HTTPException(
            status_code=400,
            detail="Start measure must be at least 1.",
        )

    if end_measure < start_measure:
        raise HTTPException(
            status_code=400,
            detail="End measure must be greater than or equal to start measure.",
        )

    output_xml = SAMPLES_DIR / "output.musicxml"
    output_midi = SAMPLES_DIR / "output.mid"
    output_png = SAMPLES_DIR / "output.png"

    try:
        logger.info(
            "Extracting measures %s through %s from %s",
            start_measure,
            end_measure,
            current_file_path.name,
        )

        image_path, notes, left, right = await run_in_threadpool(
            extract_polyrhythm,
            str(current_file_path),
            str(output_xml),
            str(output_midi),
            str(output_png),
            start_measure,
            end_measure,
        )

        if not Path(image_path).exists():
            raise RuntimeError(
                "Score image was not generated."
            )

        logger.info("Polyrhythm extraction successful.")

        return {
            "image_path": "/samples/output.png",
            "notes": notes,
            "left": left,
            "right": right,
        }

    except HTTPException:
        raise

    except Exception as e:
        logger.exception("Polyrhythm extraction failed")

        raise HTTPException(
            status_code=500,
            detail=f"Polyrhythm extraction failed: {str(e)}",
        )
