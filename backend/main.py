from fastapi import FastAPI
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv
import os
from typing import List

# Import the new function
from backend.scripts.tag_verification import verify_and_add_tags

# env vars
load_dotenv(dotenv_path='./backend/.env')

SUPABASE_URL=os.getenv("SUPABASE_URL")
SUPABASE_KEY=os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()

class UserCreate(BaseModel):
    first_name: str
    last_name: str

class TagsVerify(BaseModel):
    tags: List[str]

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

@app.post("/tags/verify")
def verify_tags_endpoint(tags_data: TagsVerify):
    try:
        verify_and_add_tags(tags_data.tags)
        return {"message": "Tags verified and added successfully."}
    except Exception as e:
        return {"error": f"Failed to verify tags: {str(e)}"}

@app.get("/tags")
def get_tags():
    try:
        response = supabase.table("tags").select("name").execute()
        if not response.data:
            return {"tags": []}
        
        tags = [item['name'] for item in response.data]
        return {"tags": tags}
    except Exception as e:
        return {"error": f"Failed to fetch tags: {str(e)}"}


