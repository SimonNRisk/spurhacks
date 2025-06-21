from fastapi import FastAPI
from fastapi import HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from supabase.client import create_client, Client 
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
from pydantic import BaseModel
import random

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

@app.get("/profile")
def get_profile():
    user_id = 1
    user = supabase.table("users").select("*").eq("id", user_id).execute().data[0]
    data = {}
    data["name"] = user["fname"] + " " + user["lname"]

    upcoming_rentals = []
    today_str = datetime.today().strftime("%Y-%m-%d")
    requests = supabase.table("requests")\
        .select("*")\
        .eq("requested_user", user_id)\
        .gt("start_date", today_str)\
        .eq("approve", 1)\
        .execute()\
        .data
    
    for request in requests:
        item = supabase.table("listings").select("*").eq("id", request["item"]).execute().data[0]
        owner = supabase.table("users").select("*").eq("id", item["user"]).execute().data[0]
        curr = {
            "id": request["id"],
            "item": item["title"],
            "start_date": request["start_date"],
            "end_date": request["end_date"],
            "renter": owner["fname"] + " " + owner["lname"],
            "price": item["price"],
            "status": "Confirmed",
        }
        upcoming_rentals.append(curr)
    
    data["upcoming_rentals"] = upcoming_rentals

    past_rentals = []
    requests = supabase.table("requests")\
        .select("*")\
        .eq("requested_user", user_id)\
        .lt("start_date", today_str)\
        .eq("approve", 1)\
        .execute()\
        .data
    for request in requests:
        item = supabase.table("listings").select("*").eq("id", request["item"]).execute().data[0]
        owner = supabase.table("users").select("*").eq("id", item["user"]).execute().data[0]
        curr = {
            "id": request["id"],
            "item": item["title"],
            "start_date": request["start_date"],
            "end_date": request["end_date"],
            "renter": owner["fname"] + " " + owner["lname"],
            "price": item["price"],
            "status": "Rented",
        }
        past_rentals.append(curr)
    
    data["past_rentals"] = past_rentals

    listed_items = []
    requests = supabase.table("listings")\
        .select("*")\
        .eq("user", user_id)\
        .execute()\
        .data
    tags = supabase.table("tags").select("*").execute().data
    tag_lookup = {tag["id"]: tag["name"] for tag in tags}
    for request in requests:

        curr = {
            "id": request["id"],
            "name": request["title"],
            "category": tag_lookup[request["tags"][0]],
            "price": request["price"],
            "status": 'active',
            "views": random.randint(150, 300),
            "bookings": random.randint(5, 15),
        }
        listed_items.append(curr)
    
    data["listed_items"] = listed_items

    your_requests = []
    requests = supabase.table("requests")\
        .select("*")\
        .eq("requested_user", user_id)\
        .eq("approve", 0)\
        .execute()\
        .data
    items = supabase.table("listings").select("*").execute().data
    items_lookup = {item["id"]: item for item in items}
    for request in requests:

        curr = {
            "id": request["id"],
            "image": "https://ftwuonnxcfpinajqnacp.supabase.co/storage/v1/object/public/listings//" + items_lookup[request["item"]]["picture"],
            "title": items_lookup[request["item"]]["title"],
            "user": items_lookup[request["item"]]["user"],
            "start_date": request["start_date"],
            "end_date": request["end_date"],
            "message": request["message"],
        }
        your_requests.append(curr)
    
    data["your_requests"] = your_requests

    pending_requests = []
    item_list = supabase.table("listings").select("*").eq("user", 1).execute().data
    item_ids = [item["id"] for item in item_list]

    requests = supabase.table("requests")\
        .select("*")\
        .eq("approve", 0)\
        .in_("item", item_ids)\
        .execute()\
        .data
    users = supabase.table("users").select("*").execute().data
    users_lookup = {user["id"]: user for user in users}
    for request in requests:

        curr = {
            "id": request["id"],
            "image": "https://ftwuonnxcfpinajqnacp.supabase.co/storage/v1/object/public/listings//" + items_lookup[request["item"]]["picture"],
            "title": items_lookup[request["item"]]["title"],
            "user": users_lookup[request["requested_user"]]["fname"] + " " + users_lookup[request["requested_user"]]["lname"],
            "start_date": request["start_date"],
            "end_date": request["end_date"],
            "message": request["message"],
        }
        pending_requests.append(curr)
    
    data["pending_requests"] = pending_requests

    return data

@app.get("/users")
def get_users():
    return supabase.table("users").select("*").execute().data