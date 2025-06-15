import requests

API_KEY = "AIzaSyAbayUoKRYotLtjcv_uzOamZz5z-HAzUMY"
API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"

def get_gemini_response(user_input):
    headers = {
        "Content-Type": "application/json"
    }
    data = {
        "contents": [
            {
                "parts": [
                    {"text": f"Reply in 2-3 short sentences: {user_input}"}
                ]
            }
        ]
    }

    try:
        response = requests.post(API_URL, headers=headers, json=data)
        result = response.json()
        return result['candidates'][0]['content']['parts'][0]['text']
    except Exception as e:
        return f"Error: {str(e)}"
