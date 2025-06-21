import openai
import os
from dotenv import load_dotenv
import sys

load_dotenv()


def classify_image_tags(image_url: str) -> list:
    client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Classify this image into tags useful for a rental app. Output only a Python list of relevant keywords."},
                    {"type": "image_url", "image_url": {"url": image_url}},
                ],
            }
        ],
        max_tokens=100
    )

    result_text = response.choices[0].message.content.strip()

    # Remove code block if present
    if result_text.startswith("```"):
        result_text = result_text.strip("`").strip()
        if result_text.startswith("python"):
            result_text = result_text[len("python"):].strip()

    return eval(result_text)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python classify.py <image_url>")
        sys.exit(1)

    image_url = sys.argv[1]
    tags = classify_image_tags(image_url)
    print("Tags:", tags)