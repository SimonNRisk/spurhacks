from fastapi import FastAPI
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv
import os

# env vars
load_dotenv()

SUPABASE_URL=os.getenv("SUPABASE_URL")
SUPABASE_KEY=os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()

class UserCreate(BaseModel):
    first_name: str
    last_name: str

@app.get("/")
def read_root():
    return {"message": "Hello Hackathon 👋"}

@app.post("/users")
def add_user(user: UserCreate):
    response = supabase.table("users").insert({
        "fname": user.first_name,
        "lname": user.last_name
    }).execute()

    if not response.data:  # Insert failed, no data returned
        return {"error": "Failed to insert user."}
    
    return {"message": "User added successfully", "data": response.data}


