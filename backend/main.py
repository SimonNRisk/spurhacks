import os
import sys
from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile, HTTPException
from pydantic import BaseModel
from supabase import create_client, Client
from typing import List
import uuid

# This setup block must be at the very top of the file
# 1. Add the project root to the python path to allow absolute imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# 2. Load environment variables from the .env file in the `backend` directory
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=dotenv_path)



# Now that the path and env vars are set, we can import our modules
from backend.scripts.tag_verification import verify_and_add_tags
from backend.scripts.photo_tags import generate_details_from_image_bytes
from backend.scripts.search_tags import classify_search_prompt
from backend.schemas import ListingCreate, Listing, SearchPrompt, SearchResult

# Initialize Supabase client using the loaded environment variables
SUPABASE_URL=os.getenv("SUPABASE_URL")
SUPABASE_KEY=os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
from fastapi import HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from supabase.client import create_client, Client 
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
from pydantic import BaseModel

load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["*"] to allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPABASE_BUCKET_URL = "https://ftwuonnxcfpinajqnacp.supabase.co/storage/v1/object/public/listings//"

class UserCreate(BaseModel):
    first_name: str
    last_name: str

class TagsVerify(BaseModel):
    tags: List[str]

@app.get("/")
def read_root():
    today = datetime.today().date()
    listings = supabase.table("listings").select("*").execute().data
    tags = supabase.table("tags").select("*").execute().data
    requests = supabase.table("requests").select("*").execute().data
    items = [requests["item"] for requests in requests]

    # Create a mapping of tag ID to name for fast lookup
    tag_lookup = {tag["id"]: tag["name"] for tag in tags}

    # Group requests by item ID for fast lookup
    from collections import defaultdict
    request_map = defaultdict(list)
    for request in requests:
        request_map[request["item"]].append(request)

    # Build the result
    result = []
    for row in listings:
        # Resolve tag names
        tag_names = [tag_lookup.get(tag_id, "Unknown") for tag_id in row["tags"]]

        availability = today.strftime('%B %d')  # default availability

        # Check if the listing is in use during a request
        for request in request_map.get(row["id"], []):
            start = datetime.strptime(request["start_date"], '%Y-%m-%d').date() - timedelta(days=1)
            end = datetime.strptime(request["end_date"], '%Y-%m-%d').date() + timedelta(days=1)
            if start <= today <= end:
                new_avail = end + timedelta(days=1)
                availability = new_avail.strftime('%B %d')
                break  # no need to check further requests
        result.append({
            "id": row["id"],
            "title": row["title"],
            "description": row["description"],
            "price": row["price"],
            "location": row["location"],
            "tags": tag_names,
            "image_url": f"{SUPABASE_BUCKET_URL}{row['picture']}",
            "availability": availability,
            "rating": row.get("rating", 0),
            "num_reviews": row.get("num_reviews", 0)
        })
    return result

@app.get("/listings/{listing_id}")
def get_listing_by_id(listing_id: int):
    today = datetime.today().date()

    # Fetch specific listing
    listings = supabase.table("listings").select("*").eq("id", listing_id).execute().data
    if not listings:
        raise HTTPException(status_code=404, detail="Listing not found")
    listing = listings[0]

    # Fetch all tags and requests (for name resolution and availability)
    tags = supabase.table("tags").select("*").execute().data
    requests = supabase.table("requests").select("*").eq("item", listing_id).execute().data

    # Build tag lookup
    tag_lookup = {tag["id"]: tag["name"] for tag in tags}
    tag_names = [tag_lookup.get(tag_id, "Unknown") for tag_id in listing["tags"]]

    # Calculate availability
    availability = today.strftime('%B %d')
    for request in requests:
        start = datetime.strptime(request["start_date"], '%Y-%m-%d').date() - timedelta(days=1)
        end = datetime.strptime(request["end_date"], '%Y-%m-%d').date() + timedelta(days=1)
        if start <= today <= end:
            availability = (end + timedelta(days=1)).strftime('%B %d')
            break
    user = supabase.table("users").select("*").eq("id", listing["user"]).execute().data[0]
    requests = (
        supabase.table("requests")
        .select("*")
        .eq("approve", 1)
        .eq("item", listing_id)
        .execute()
        .data
    )
    unavailable_dates = []
    for request in requests:
        unavailable_dates.append({ "start": request["start_date"], "end": request["end_date"] })
    return {
        "id": listing["id"],
        "title": listing["title"],
        "description": listing["description"],
        "price": listing["price"],
        "location": listing["location"],
        "tags": tag_names,
        "image_url": f"{SUPABASE_BUCKET_URL}{listing['picture']}",
        "availability": availability,
        "user": user["fname"] + " " + user["lname"],
        "rating": listing.get("rating", 0),
        "num_reviews": listing.get("num_reviews", 0),
        "unavailable_dates": unavailable_dates
    }

class ReservationRequest(BaseModel):
    item: int
    user: int
    start_date: str  # Format: 'YYYY-MM-DD'
    end_date: str    # Format: 'YYYY-MM-DD'
    message: str

@app.post("/requests")
def create_reservation(reservation: ReservationRequest):
    # Insert reservation into the 'requests' table
    response = supabase.table("requests").insert({
        "item": reservation.item,
        "requested_user": 1,
        "start_date": reservation.start_date,
        "end_date": reservation.end_date,
        "message": reservation.message,
        "approve": 0  # default to not approved yet
    }).execute()

    # if response.status_code != 201:
    #     raise HTTPException(status_code=400, detail="Failed to create reservation")

    return {"message": "Reservation request submitted successfully"}

@app.get("/users")
def get_users():
    return supabase.table("users").select("*").execute().data
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

@app.post("/search/analyze", response_model=SearchResult)
def analyze_search_prompt(search_data: SearchPrompt):
    """
    Analyzes a user's search prompt and returns relevant tags, description, and location.
    This endpoint calls the search_tags.py functionality to process natural language queries.
    """
    try:
        # Call the search_tags function to analyze the prompt
        result = classify_search_prompt(search_data.prompt)
        
        return SearchResult(
            tags=result.get("tags", []),
            description=result.get("description", ""),
            location=result.get("location", "unknown")
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze search prompt: {str(e)}")


