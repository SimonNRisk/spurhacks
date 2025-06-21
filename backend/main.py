from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from supabase.client import create_client, Client 
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta

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

@app.get("/users")
def get_users():
    return supabase.table("users").select("*").execute().data