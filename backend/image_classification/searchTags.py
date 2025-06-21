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
                    f"I'm building a rental app. Given this user message: \"{prompt}\", extract relevant information about what the user might be looking for. "
                    "Respond ONLY as a JSON object with exactly three fields:\n"
                    "1. \"tags\": an array of keywords that describe what they might need\n"
                    "2. \"description\": a short natural language summary of their intent\n"
                    "3. \"location\": a rough location if mentioned (e.g., 'Canada', 'Barrie', 'Toronto'); otherwise return 'unknown'\n\n"
                    "Example output:\n"
                    "{\"tags\": [\"ski\", \"winter gear\"], \"description\": \"User is preparing for a winter trip.\", \"location\": \"up north\"}"
                )
            }
        ],
        max_tokens=200
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