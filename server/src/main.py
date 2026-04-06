from fastapi import FastAPI, UploadFile
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from .part import parse
from fastapi.concurrency import run_in_threadpool

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase URL or service role key not set in environment variables!")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()

@app.get("/")
async def root():
    input_file = "server/src/samples/test.musicxml"
    output_xml = "server/src/samples/output.musicxml"
    output_midi = "server/src/samples/output.mid"
    output_png = "server/src/samples/output.png"

    start_measure = 2
    end_measure = 3

    notes = []
    
    out_object = await run_in_threadpool(parse, input_file, output_xml, output_midi, output_png, start_measure, end_measure, notes)
    return {"image_path": out_object[0], "notes": out_object[1]}

