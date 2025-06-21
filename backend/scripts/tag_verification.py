import os
import numpy as np
from openai import OpenAI
from supabase import create_client, Client

# The .env file is now loaded by main.py, so we don't need to do it here.

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

def verify_and_add_tags(new_tags: list[str]) -> list[str]:
    """
    Verifies a list of new tags against existing tags in the database.
    If a new tag is not similar to any existing tag, it's added to the DB.
    Returns a cleaned list of tags, preferring existing tags over similar new ones.
    """
    # 1. Fetch existing tags and their embeddings from the database
    response = supabase.table('tags').select('name').execute()
    existing_tags = [item['name'] for item in response.data] if response.data else []
    
    if not existing_tags:
        print("No existing tags found. Adding all new tags.")
        if new_tags:
            tags_to_add = [{'name': tag} for tag in new_tags]
            supabase.table('tags').insert(tags_to_add).execute()
        return new_tags

    existing_tags_embeddings = {tag: get_embedding(tag) for tag in existing_tags}
    
    verified_tags = set()
    tags_to_add_to_db = []

    # 2. Compare each new tag with all existing tags
    for new_tag in new_tags:
        if new_tag in existing_tags:
            verified_tags.add(new_tag)
            continue

        max_similarity = 0
        most_similar_tag = None

        new_tag_embedding = get_embedding(new_tag)

        for existing_tag, existing_tag_embedding in existing_tags_embeddings.items():
            similarity = cosine_similarity(new_tag_embedding, existing_tag_embedding)
            if similarity > max_similarity:
                max_similarity = similarity
                most_similar_tag = existing_tag
        
        # 3. Decide whether to use an existing tag or add the new one
        if max_similarity >= SIMILARITY_THRESHOLD:
            # New tag is very similar to an existing one, use the existing tag
            verified_tags.add(most_similar_tag)
            print(f"New tag '{new_tag}' is similar to '{most_similar_tag}'. Using existing tag.")
        else:
            # New tag is unique, add it to the list for DB insertion and results
            verified_tags.add(new_tag)
            if new_tag not in tags_to_add_to_db:
                 tags_to_add_to_db.append(new_tag)
            print(f"'{new_tag}' is not similar to any existing tags. Adding to DB.")

    # 4. Add all new unique tags to the database in a single batch
    if tags_to_add_to_db:
        new_tag_records = [{'name': tag} for tag in tags_to_add_to_db]
        supabase.table('tags').insert(new_tag_records).execute()
        print(f"Added new tags to DB: {tags_to_add_to_db}")

    return list(verified_tags)

if __name__ == '__main__':
    # Example usage
    sample_tags = ["outdoors", "skiing", "winter sports", "mountain", "snowboarding gear"]
    print(f"Verifying sample tags: {sample_tags}")
    verified_tags = verify_and_add_tags(sample_tags)
    print(f"Verified tags: {verified_tags}")