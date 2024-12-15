# api/generate_api.py
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from linkedin_api import Linkedin
from openai import OpenAI
from typing import Dict, Literal
from scrape import compare_profiles, get_profile
import os
from dotenv import load_dotenv
from pathlib import Path

# Get the root directory (where .env is located)
root_dir = Path(__file__).parent.parent
# Load environment variables from .env file
load_dotenv(root_dir / '.env')

app = Flask(__name__)
CORS(app)

def generate_connection_message(
    sender_profile: Dict,
    target_profile: Dict,
    openai_api_key: str,
    tone: Literal["formal", "casual", "professional"] = "professional"
) -> Dict:
    """
    Generate a personalized LinkedIn connection message from sender to target using OpenAI.
    """
    client = OpenAI(api_key=openai_api_key)
    
    prompt = f"""
    You are helping the sender write a LinkedIn connection request to the target.
    
    I AM (SENDER):
    {sender_profile}
    
    I WANT TO CONNECT WITH (TARGET):
    {target_profile}
    
    Write a connection request message from my perspective (sender) to connect with the target.
    
    Please provide a JSON response with the following structure:
    {{
        "commonalities": {{
            "description": "Analysis of meaningful connections between our profiles",
            "key_points": ["List the specific things we have in common"]
        }},
        "message": {{
            "text": "The connection request I (sender) will send to them (target)",
            "reasoning": "Why this message would be effective for me to send them"
        }},
        "conversation_starters": [
            "3-4 specific topics or questions I could discuss with them after connecting"
        ]
    }}

    Requirements for my message:
    1. Write in first person (from my perspective as sender)
    2. Use {tone} tone
    3. Keep under 300 characters
    4. Reference something specific from their profile
    5. Include why I want to connect with them
    6. End with a specific question
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are helping the sender write an effective LinkedIn connection request. Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        try:
            return json.loads(response.choices[0].message.content)
        except json.JSONDecodeError as e:
            return {
                "error": f"Failed to parse response as JSON: {str(e)}",
                "raw_response": response.choices[0].message.content
            }
    except Exception as e:
        return {"error": f"Failed to generate message: {str(e)}"}

@app.route('/api/generate-message', methods=['POST'])
def handle_message_generation():
    try:
        print("Received request")
        data = request.get_json()
        print("Request data:", data)
        
        # Get LinkedIn usernames and parameters
        sender = data.get('sender')
        target_username = data.get('targetUsername')
        tone = data.get('tone', 'professional')
        
        # Get environment variables
        linkedin_api_username = os.getenv('LINKEDIN_API_USERNAME')
        linkedin_api_password = os.getenv('LINKEDIN_API_PASSWORD')
        openai_api_key = os.getenv('OPENAI_API_KEY')
        
        # Get LinkedIn profiles and extract data correctly
        profiles = compare_profiles(
            sender,
            target_username,
            linkedin_api_username,
            linkedin_api_password
        )
        
        # The profile data is nested twice under the username
        target_profile_data = profiles[target_username][target_username]
        
        # Generate message
        message_data = generate_connection_message(
            sender_profile=sender,
            target_profile=target_profile_data,
            openai_api_key=openai_api_key,
            tone=tone
        )
        
        # Extract profile info
        basic_info = target_profile_data.get('basic_info', {})
        experience = target_profile_data.get('experience', [{}])[0]
        
        profile_info = {
            "name": basic_info.get('name', 'Unknown'),
            "company": experience.get('company', 'Unknown'),
            "position": experience.get('title', 'Unknown')
        }
        
        print("Profile info being returned:", profile_info)
        
        # Return combined response with both message and profile info
        response = {
            "id": profiles.get('id'),  # Include the ID from profiles
            "message": message_data,
            "profileInfo": profile_info
        }
        
        print("Final response:", response)
        return jsonify(response)
            
    except Exception as e:
        print("Error:", str(e))
        print("Profiles structure:", profiles)
        return jsonify({
            "error": f"Server error: {str(e)}"
        }), 500
    

@app.route('/api/fetch-profile', methods=['POST'])
def handle_profile_fetch():
    try:
        data = request.get_json()
        username = data.get('username')

        print("username: " + username)
        
        if not username:
            return jsonify({
                "error": "Username is required"
            }), 400
            
        api = Linkedin(
            os.getenv('LINKEDIN_API_USERNAME'),
            os.getenv('LINKEDIN_API_PASSWORD')
        )
        
        # Use existing get_profile function
        profile_data = get_profile(api, username)

        print(profile_data)
        
        # Return the profile data for the username
        return jsonify(profile_data[username])
            
    except Exception as e:
        print("Error:", str(e))
        return jsonify({
            "error": f"Server error: {str(e)}"
        }), 500

if __name__ == '__main__':
    required_env_vars = [
        'SENDER_USERNAME',
        'LINKEDIN_API_USERNAME',
        'LINKEDIN_API_PASSWORD',
        'OPENAI_API_KEY'
    ]
    
    # Check environment variables
    missing_vars = [var for var in required_env_vars if not os.getenv(var)]
    if missing_vars:
        print(f"Missing required environment variables: {missing_vars}")
        exit(1)
        
    print("Starting Flask server on port 8000...")
    app.run(host='0.0.0.0', port=8000, debug=True)