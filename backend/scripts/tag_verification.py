import os
import numpy as np
from dotenv import load_dotenv
from openai import OpenAI
from supabase import create_client, Client

# Load environment variables from .env file
load_dotenv(dotenv_path='./backend/.env')

# Initialize OpenAI client
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise ValueError("OPENAI_API_KEY not found in .env file")
client = OpenAI(api_key=openai_api_key)

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
if not supabase_url or not supabase_key:
    raise ValueError("Supabase URL or Key not found in .env file")
supabase: Client = create_client(supabase_url, supabase_key)

SIMILARITY_THRESHOLD = 0.8  # Adjust this value based on desired similarity strictness

def get_embedding(text, model="text-embedding-3-small"):
    """Generates an embedding for a given text using OpenAI."""
    text = text.replace("\n", " ")
    return client.embeddings.create(input=[text], model=model).data[0].embedding

def cosine_similarity(v1, v2):
    """Calculates the cosine similarity between two vectors."""
    return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))

def verify_and_add_tags(new_tags: list[str]):
    """
    Verifies a list of new tags against existing tags in the database.
    Adds new, non-similar tags to the database.
    """
    # 1. Fetch existing tags from the database
    response = supabase.table('tags').select('name').execute()
    if not response.data:
        existing_tags = []
    else:
        existing_tags = [item['name'] for item in response.data]

    print(f"Existing tags: {existing_tags}")

    if not existing_tags:
        print("No existing tags found. Adding all new tags.")
        tags_to_add = [{'name': tag} for tag in new_tags]
        supabase.table('tags').insert(tags_to_add).execute()
        print(f"Added new tags: {new_tags}")
        return

    # 2. Get embeddings for existing and new tags
    existing_tags_embeddings = {tag: get_embedding(tag) for tag in existing_tags}
    new_tags_embeddings = {tag: get_embedding(tag) for tag in new_tags}

    tags_to_add = []

    # 3. Compare each new tag with all existing tags
    for new_tag, new_tag_embedding in new_tags_embeddings.items():
        if new_tag in existing_tags:
            print(f"Tag '{new_tag}' already exists. Skipping.")
            continue

        max_similarity = 0
        most_similar_tag = None

        for existing_tag, existing_tag_embedding in existing_tags_embeddings.items():
            similarity = cosine_similarity(new_tag_embedding, existing_tag_embedding)
            if similarity > max_similarity:
                max_similarity = similarity
                most_similar_tag = existing_tag
        
        print(f"New tag: '{new_tag}', Most similar existing tag: '{most_similar_tag}', Similarity: {max_similarity:.4f}")

        if max_similarity < SIMILARITY_THRESHOLD:
            tags_to_add.append(new_tag)
            print(f"'{new_tag}' is not similar to any existing tags. Adding to DB.")
        else:
            print(f"'{new_tag}' is too similar to '{most_similar_tag}'. Not adding.")

    # 4. Add new tags to the database
    if tags_to_add:
        new_tag_records = [{'name': tag} for tag in tags_to_add]
        supabase.table('tags').insert(new_tag_records).execute()
        print(f"Added new tags: {tags_to_add}")
    else:
        print("No new tags to add.")

if __name__ == '__main__':
    # Example usage
    sample_tags = ["outdoors", "skiing", "winter sports", "mountain", "snowboarding gear"]
    print(f"Verifying sample tags: {sample_tags}")
    verify_and_add_tags(sample_tags)