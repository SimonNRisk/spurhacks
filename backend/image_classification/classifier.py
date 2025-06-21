import openai
import sys
import os

# ✅ Set your OpenAI API key securely
openai.api_key = os.getenv("OPENAI_API_KEY")  # Recommended
# Alternatively, uncomment and paste directly (not recommended):
# openai.api_key = "sk-..."

def classify_image_tags(image_url: str) -> list:
    client = openai.OpenAI()

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Classify this image into tags useful for a rental app. Output only a Python list of relevant keywords."
                    },
                    {"type": "image_url", "image_url": {"url": image_url}},
                ],
            }
        ],
        max_tokens=100
    )

    result_text = response.choices[0].message.content
    print("Raw Output:", result_text)
    return eval(result_text)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python classify.py <image_url>")
        sys.exit(1)

    image_url = sys.argv[1]
    tags = classify_image_tags(image_url)
    print("Tags:", tags)