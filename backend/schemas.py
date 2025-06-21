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

class Listing(BaseModel):
    id: int
    created_at: datetime
    title: str
    description: str
    quantity: int
    price: float  # Assuming price is a float, even if stored as varchar
    tags: List[int] # This is a list of tag IDs
    picture: Optional[str] = None
    location: str
    user_id: int
    rating: Optional[float] = None
    num_ratings: Optional[int] = None

    class Config:
        orm_mode = True
