import openai
import os
import sys
import json
from dotenv import load_dotenv

load_dotenv()

def classify_search_prompt(prompt: str) -> dict:
    client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": (
                    f"I am building a rental app. Given this user message: \"{prompt}\", extract relevant tags that describe what the user might be looking for. "
                    "Output your answer as a JSON object with the following format: "
                    "{\"tags\": [\"tag1\", \"tag2\", ...], \"summary\": \"Short natural language summary of what this user wants.\"}"
                )
            }
        ],
        max_tokens=150
    )

    result_text = response.choices[0].message.content.strip()

    # Handle code block formatting if present
    if result_text.startswith("```"):
        result_text = result_text.strip("`").strip()
        if result_text.startswith("json"):
            result_text = result_text[len("json"):].strip()

    return json.loads(result_text)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python searchTags.py \"<search prompt>\"")
        sys.exit(1)

    prompt = sys.argv[1]
    result = classify_search_prompt(prompt)
    print(json.dumps(result, indent=2))
