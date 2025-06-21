import openai
import os
import sys
import json
from dotenv import load_dotenv

load_dotenv()

def classify_image(image_url: str) -> dict:
    client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": (
                            "Classify this image into tags useful for a rental app, and also give a short natural language description of the item. "
                            "Respond only as a JSON object with two fields: 'tags' (a list of keywords) and 'description' (a string). "
                            "Example format: {\"tags\": [\"ski\", \"winter\"], \"description\": \"These are a pair of skis...\"}"
                        )
                    },
                    {"type": "image_url", "image_url": {"url": image_url}},
                ],
            }
        ],
        max_tokens=200
    )

    result_text = response.choices[0].message.content.strip()

    # Clean code block wrapper if present
    if result_text.startswith("```"):
        result_text = result_text.strip("`").strip()
        if result_text.startswith("json"):
            result_text = result_text[len("json"):].strip()

    # Parse JSON safely
    return json.loads(result_text)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python classifier.py <image_url>")
        sys.exit(1)

    image_url = sys.argv[1]
    result = classify_image(image_url)
    print(json.dumps(result, indent=2))
