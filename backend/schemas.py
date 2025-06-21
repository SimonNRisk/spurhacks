from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date

class Tag(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True

class User(BaseModel):
    id: int
    fname: str
    lname: str

    class Config:
        orm_mode = True

class Request(BaseModel):
    id: int
    created_at: datetime
    requester_id: int
    item_id: int
    start_date: date
    end_date: date
    message: Optional[str] = None
    approve: Optional[int] = None

    class Config:
        orm_mode = True

# A base model with fields common to creating and reading listings
class ListingBase(BaseModel):
    title: str
    description: str
    quantity: str # Changed to string to match DB varchar
    price: float
    picture: Optional[str] = None # This will hold the photo_path
    location: str
    user: int # Changed from user_id to match DB

# Model for creating a listing - accepts tag names
class ListingCreate(ListingBase):
    tags: List[str]

# Model for reading/returning a listing from the DB
class Listing(ListingBase):
    id: int
    created_at: datetime
    tags: List[int] # In the DB, this is a list of IDs
    rating: Optional[float] = None
    num_reviews: Optional[int] = None # Changed from num_ratings to match DB

    class Config:
        orm_mode = True
