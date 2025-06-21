from fastapi import FastAPI
from supabase.client import create_client, Client 
import os
from dotenv import load_dotenv

load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Supabase connected!"}

@app.get("/users")
def get_users():
    return supabase.table("users").select("*").execute().data