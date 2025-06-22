import openai
import os
import sys
import json
import base64

# The .env file is now loaded by main.py, so we don't need to do it here.

def generate_details_from_image_bytes(image_bytes: bytes) -> dict:
    """
    Uses OpenAI's vision model to generate a description and tags from image bytes.
    """
    client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    base64_image = base64.b64encode(image_bytes).decode('utf-8')

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": (
                            "Analyze this image of an item to be rented out. Provide:\n"
                            "1. A literal 4-word description of what you see (like 'Red Mountain Bike Frame' or 'Black Power Drill Tool')\n"
                            "2. A concise, appealing one-sentence description for details\n"
                            "3. Up to 5 relevant one or two-word tags for categorization\n\n"
                            "Respond ONLY as a JSON object with three keys: 'title' (a string), 'description' (a string), and 'tags' (a list of lowercase strings)."
                        )
                    },
                    {
                        "type": "image_url", 
                        "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}
                    },
                ],
            }
        ],
        max_tokens=300
    )

    result_text = response.choices[0].message.content.strip()

    # Clean code block wrapper if present
    if result_text.startswith("```"):
        result_text = result_text.strip("`").strip()
        if result_text.startswith("json"):
            result_text = result_text[len("json"):].strip()

    # Parse JSON safely
    try:
        return json.loads(result_text)
    except (json.JSONDecodeError, IndexError):
        return {"description": "Could not generate description.", "tags": []}

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python photo_tags.py <path_to_image>")
        sys.exit(1)

    image_path = sys.argv[1]
    try:
        with open(image_path, "rb") as image_file:
            image_bytes = image_file.read()
            result = generate_details_from_image_bytes(image_bytes)
            print(json.dumps(result, indent=2))
    except FileNotFoundError:
        print(f"Error: Image file not found at {image_path}")
        sys.exit(1)
