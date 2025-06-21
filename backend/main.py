from fastapi import FastAPI
from supabase.client import create_client, Client 
import os
from dotenv import load_dotenv

load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

app = FastAPI()

SUPABASE_BUCKET_URL = "https://ftwuonnxcfpinajqnacp.supabase.co/storage/v1/object/public/listings//"

@app.get("/")
def read_root():
    listings = supabase.table("listings").select("*").execute().data
    result = []
    for row in listings:
        result.append({
            "id": row["id"],
            "title": row["title"],
            "description": row["description"],
            "price": row["price"],
            "location": row["location"],
            "tags": row["tags"],
            "image_url": f"{SUPABASE_BUCKET_URL}{row['picture']}"
        })
    return result

@app.get("/users")
def get_users():
    return supabase.table("users").select("*").execute().data