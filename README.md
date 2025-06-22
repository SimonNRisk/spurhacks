# Boro: Premium Rental Marketplace

A borrowing platform that helps people enjoy higher cost experiences without committing to long term purchases! 

## 📖 About

This project was built for **SpurHacks 2025** for the **Startup track**. 

The idea is pretty simple - why buy expensive stuff you'll only use once or twice? Our platform lets you borrow everything from power tools and cameras to gaming setups and party equipment from people in your community. It's like Airbnb but for literally anything you need!

We added some cool AI features that automatically generate listings when you upload photos and help you find exactly what you're looking for with smart search.

## 😎 The Team (go qtma!)

Kayne Lee - developer
Chloe Houvardas - developer
Simon Risk - developer
Nicole Steiner - business strategist

## 🚀 Features

- **Browse Listings**: Find cool stuff to borrow near you
- **Smart Search**: Just type what you need and our AI figures out what you're looking for
- **Auto Listing Creation**: Take a pic of your item and AI writes the whole listing for you (pretty neat!)
- **Booking System**: Reserve items for specific dates 
- **User Profiles**: Keep track of your stuff and what you're borrowing
- **Live Availability**: See when items are free to borrow
- **Clean UI**: Looks good on mobile and desktop

## 🛠️ Tech Stack

We used some pretty cool tech for this project:

### Frontend
- **React 18** with TypeScript - for building the UI
- **Vite** - super fast development server
- **Tailwind CSS** - makes styling way easier
- **shadcn/ui** - pre-built components that look amazing
- **React Router** - handles page navigation
- **React Query** - fetches data from our API
- **React Hook Form** - handles all the forms

### Backend
- **FastAPI** (Python) - our main API server
- **Supabase** - handles our database and file storage
- **OpenAI GPT-4 Vision** - the AI that looks at photos and generates listings
- **Pydantic** - makes sure our data is formatted correctly

## 📁 Project Structure

```
spurhacks/
├── src/                          # Frontend React application
│   ├── components/               # React components
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── AddListingModal.tsx  # Create new listings
│   │   ├── ListingCard.tsx      # Display listing cards
│   │   ├── ListingPage.tsx      # Individual listing details
│   │   └── ProfilePage.tsx      # User profile management
│   ├── data/                    # Mock data and types
│   ├── pages/                   # Main app pages
│   └── lib/                     # Utility functions
├── backend/                     # Python FastAPI backend
│   ├── main.py                  # Main API endpoints
│   ├── schemas.py               # Pydantic data models
│   ├── scripts/                 # AI processing modules
│   │   ├── photo_tags.py        # Image analysis with GPT-4V
│   │   ├── search_tags.py       # Search classification
│   │   └── tag_verification.py  # Tag validation
│   └── requirements.txt         # Python dependencies
└── public/                      # Static assets
```

## 🔧 Getting It Running

### What You Need First
- Node.js (v18 or newer)
- Python (v3.8 or newer) 
- A Supabase account (it's free!)
- OpenAI API key (you might need to pay a bit for this)

### Setting Up the Frontend

1. Install all the packages:
```bash
npm install
```

2. Start it up:
```bash
npm run dev
```

Go to `http://localhost:5173` and you should see it working!

### Setting Up the Backend

1. Go to the backend folder:
```bash
cd backend
```

2. Make a virtual environment (trust me, you want this):
```bash
python -m venv venv
source venv/bin/activate  # If you're on Windows: venv\Scripts\activate
```

3. Install Python packages:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the backend folder with your API keys:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

5. Start the server:
```bash
uvicorn main:app --reload
```

Your API should be running at `http://localhost:8000`

## 🗄️ Database Stuff

We're using Supabase for our database. Here's what we store:

- **listings**: All the item info (title, description, price, location, tags, photos)
- **users**: User profiles and login stuff
- **requests**: When people want to borrow things
- **tags**: Categories for items (like "tools", "electronics", etc.)

## 🤖 The AI Magic

### Auto Listing Creation
- Upload a photo of whatever you want to lend out
- Our AI (GPT-4 Vision) looks at the image 
- It automatically writes:
  - A 4-word title
  - A nice description 
  - Relevant tags

### Smart Search
Instead of having to use exact keywords, you can just type stuff like "I need something to cut wood" and it'll find chainsaws, saws, etc. The AI understands what you actually want.

## 📱 How To Use It

### Lending Your Stuff
1. Hit "Add Listing" on the main page
2. Take a photo of your item
3. The AI writes everything for you (but you can edit it if you want)
4. Set how much you want to charge per day
5. Add your location and you're done!

### Borrowing Something
1. Search for what you need or just browse around
2. Click on something that looks good
3. Pick the dates you need it
4. Send a request to the owner
5. Wait for them to approve it

### Managing Everything
Check your profile to see:
- Stuff you're lending out
- Things you've requested to borrow
- What's coming up
- Your borrowing history
