from flask import Flask, request, jsonify
from flask_cors import CORS
from gemini_chat import get_gemini_response  # import from above step

app = Flask(__name__)
CORS(app)

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_input = data.get("message", "")
    
    response = get_gemini_response(user_input)
    return jsonify({"response": response})

if __name__ == '__main__':
    app.run(debug=True)
