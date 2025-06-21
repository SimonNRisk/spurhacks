import os
import sys
from dotenv import load_dotenv

# This setup block must be at the very top of the file
# 1. Add the project root to the python path to allow absolute imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# 2. Load environment variables from the .env file in the `backend` directory
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=dotenv_path)


from fastapi import FastAPI, File, UploadFile, HTTPException
from pydantic import BaseModel
from supabase import create_client, Client
from typing import List
import uuid

# Now that the path and env vars are set, we can import our modules
from backend.scripts.tag_verification import verify_and_add_tags
from backend.scripts.photo_tags import generate_details_from_image_bytes
from backend.schemas import ListingCreate, Listing

# Initialize Supabase client using the loaded environment variables
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

@app.post("/listings/generate-details")
async def generate_details_from_upload(file: UploadFile = File(...)):
    """
    Accepts an image upload, generates details and tags, verifies the tags,
    uploads the image to storage, and returns the details.
    """
    try:
        image_bytes = await file.read()
        
        # 1. Generate description and tags from image
        details = generate_details_from_image_bytes(image_bytes)
        description = details.get("description", "No description generated.")
        initial_tags = details.get("tags", [])

        # 2. Verify and clean the tags
        verified_tags = verify_and_add_tags(initial_tags)

        # 3. Upload image to Supabase Storage
        bucket_name = "listings"
        # Sanitize filename to prevent path traversal issues, although UUID is safer
        safe_filename = file.filename.replace("..", "").replace("/", "")
        # Use a simpler path for the DB
        image_path = f"public/{uuid.uuid4()}-{safe_filename}"
        
        # Reset file pointer before upload
        await file.seek(0)
        
        supabase.storage.from_(bucket_name).upload(
            file=image_bytes,
            path=image_path,
            file_options={"content-type": file.content_type}
        )

        # 4. Get public URL for the uploaded image
        image_url = supabase.storage.from_(bucket_name).get_public_url(image_path)
        
        return {
            "description": description,
            "tags": verified_tags,
            "photo_url": image_url, # For frontend display
            "photo_path": image_path  # For frontend to send back when creating listing
        }

    except Exception as e:
        return {"error": f"Failed to process image: {str(e)}"}


@app.post("/listings", response_model=Listing)
def create_listing(listing_data: ListingCreate):
    """
    Creates a new listing in the database.
    Handles converting tag names (str) to tag IDs (int).
    """
    try:
        # 1. Convert tag names to tag IDs
        tag_names = listing_data.tags
        
        # Fetch all tags from DB that match the names provided
        tags_response = supabase.table("tags").select("id, name").in_("name", tag_names).execute()
        
        if not tags_response.data and tag_names:
            # This case is unlikely if tags come from our verification step, but good to have
            raise HTTPException(status_code=400, detail="One or more tags provided do not exist.")

        tag_map = {item['name']: item['id'] for item in tags_response.data}
        tag_ids = [tag_map[name] for name in tag_names if name in tag_map]
        
        # 2. Prepare listing data for insertion
        listing_dict = listing_data.model_dump(exclude={"tags"})
        listing_dict['tags'] = tag_ids # Replace string tags with int IDs

        # 3. Insert the new listing into the database
        insert_response = supabase.table("listings").insert(listing_dict).execute()

        if not insert_response.data:
            raise HTTPException(status_code=500, detail="Failed to create listing in database.")

        # 4. Return the newly created listing data
        created_listing = insert_response.data[0]
        return created_listing

    except Exception as e:
        # Catch potential exceptions from DB or logic
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


