# api/generate_api.py
import json
from bs4 import BeautifulSoup
from flask import Flask, request, jsonify
from flask_cors import CORS
from linkedin_api import Linkedin
from openai import OpenAI
from typing import Dict, List, Literal
import os
from dotenv import load_dotenv
from pathlib import Path
from functools import lru_cache
from concurrent.futures import ThreadPoolExecutor
import threading
from threading import Lock
import time

import requests

import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from api.scrape import get_profile

# Get the root directory (where .env is located)
root_dir = Path(__file__).parent.parent
load_dotenv(root_dir / '.env')

app = Flask(__name__)
CORS(app)


RAPIDAPI_KEY = os.getenv('RAPIDAPI_KEY')
RAPIDAPI_HOST = "linkedin-api8.p.rapidapi.com"

# Thread-safe cache for profiles
profile_cache = {}
profile_cache_lock = Lock()
profile_cache_ttl = 3600  # 1 hour TTL

# Thread pool for parallel processing
executor = ThreadPoolExecutor(max_workers=10)

@lru_cache(maxsize=1)
def get_linkedin_client():
    return Linkedin(
        os.getenv('LINKEDIN_API_USERNAME'),
        os.getenv('LINKEDIN_API_PASSWORD')
    )

@lru_cache(maxsize=1)
def get_openai_client():
    return OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def fetch_profile_parallel(username: str) -> Dict:
    """Fetch both profile and contact info in parallel"""
    api = get_linkedin_client()
    
    def get_profile_data():
        profile = get_profile(username)
        return profile
    
    def get_contact_data():
        return api.get_profile_contact_info(username)
    
    # Execute both requests in parallel
    with ThreadPoolExecutor(max_workers=2) as executor:
        profile_future = executor.submit(get_profile_data)
        contact_future = executor.submit(get_contact_data)
        
        profile = profile_future.result()
        contact = contact_future.result()
        
        return profile, contact

import time
import json
import http.client
from typing import Dict
import os
from dotenv import load_dotenv
from threading import Lock

# Load environment variables
load_dotenv()

RAPIDAPI_KEY = os.getenv('RAPIDAPI_KEY')
RAPIDAPI_HOST = "linkedin-api8.p.rapidapi.com"

# Thread-safe cache setup
profile_cache = {}
profile_cache_lock = Lock()
profile_cache_ttl = 3600  # 1 hour TTL

def get_cached_profile(username: str) -> Dict:
    """Get profile from cache or fetch if needed"""
    current_time = time.time()
    
    with profile_cache_lock:
        if username in profile_cache:
            cached_data, timestamp = profile_cache[username]
            if current_time - timestamp < profile_cache_ttl:
                return cached_data
    
    try:
        # Setup connection to RapidAPI
        conn = http.client.HTTPSConnection(RAPIDAPI_HOST)
        
        headers = {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': RAPIDAPI_HOST
        }
        
        # Make request
        conn.request("GET", f"/?username={username}", headers=headers)
        response = conn.getresponse()
        
        if response.status != 200:
            raise Exception(f"API request failed with status {response.status}")
            
        # Parse response
        profile_data = json.loads(response.read().decode("utf-8"))
        
        # Process profile data
        processed_data = {
            "basic_info": {
                "name": f"{profile_data.get('firstName', '')} {profile_data.get('lastName', '')}".strip(),
                "industry": profile_data.get('industryName'),
                "location": (profile_data.get('geo', {}) or {}).get('full'),
                "headline": profile_data.get('headline'),
                "email": None  # RapidAPI doesn't provide email
            }
        }
        
        # Only include non-empty sections
        if positions := profile_data.get('position', []):
            processed_data["experience"] = [
                {
                    "title": exp.get('title'),
                    "company": exp.get('companyName'),
                    "duration": f"{exp.get('start', {}).get('year', '')}-"
                              f"{exp.get('end', {}).get('year', 'Present')}",
                    "location": exp.get('location'),
                }
                for exp in positions[:3]  # Limit to 3 most recent
            ]
        
        if education := profile_data.get('educations', []):
            processed_data["education"] = [
                {
                    "school": edu.get('schoolName'),
                    "degree": edu.get('degree'),
                    "field": edu.get('fieldOfStudy'),
                }
                for edu in education[:2]  # Limit to 2 most recent
            ]
        
        if skills := profile_data.get('skills', []):
            processed_data["skills"] = [
                skill.get('name') for skill in skills[:5]  # Limit to 5 skills
            ]
        
        # Cache the processed data
        with profile_cache_lock:
            profile_cache[username] = (processed_data, current_time)
        
        return processed_data
        
    except Exception as e:
        print(f"Error fetching profile for {username}: {str(e)}")
        return {"error": str(e)}
    finally:
        if 'conn' in locals():
            conn.close()

@lru_cache(maxsize=100)
def generate_message_cached(sender_str: str, target_str: str, tone: str) -> Dict:
    """Generate message with caching based on input strings"""
    client = get_openai_client()
    
    # Simplified prompt for faster processing
    prompt = f"""
    Write a personalized LinkedIn connection message to initiate a meaningful conversation for a potential job-seeker sender:
    SENDER: {sender_str}
    TARGET: {target_str}
    TONE: {tone}
    
    Requirements:
    - Max 300 characters
    - Reference something specific within their profile
    - Include why sender want to connect with target
    - End with a question
    - Format as JSON with: message.text, commonalities.key_points (list), conversation_starters (list)
    """

    # print("PROMPT: " + prompt)
    
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are helping the sender write an effective LinkedIn connection request Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500  # Limit response size
        )
        # print("RESPONSE: " + response.choices[0].message.content)
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        return {"error": str(e)}

@app.route('/api/generate-message', methods=['POST'])
def handle_message_generation():
    try:
        data = request.get_json()
        target_username = data.get('targetUsername')
        tone = data.get('tone', 'professional')
        
        # Get target profile and process message in parallel
        def process_request():
            target_profile = get_cached_profile(target_username)
                        
            # Generate message using cached function
            message = generate_message_cached(
                json.dumps(data.get('sender'), sort_keys=True),
                json.dumps(target_profile, sort_keys=True),
                tone
            )
            
            # Extract basic info
            basic_info = target_profile.get('basic_info', {})
            experience = target_profile.get('experience', [{}])[0]
            
            return {
                "id": target_username,
                "message": message,
                "profileInfo": {
                    "name": basic_info.get('name', 'Unknown'),
                    "company": experience.get('company', 'Unknown'),
                    "position": experience.get('title', 'Unknown')
                }
            }
        
        # Execute in thread pool
        future = executor.submit(process_request)
        return jsonify(future.result())
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/fetch-profile', methods=['POST'])
def handle_profile_fetch():
    try:
        username = request.get_json().get('username')
        if not username:
            return jsonify({"error": "Username required"}), 400
            
        # Execute in thread pool
        future = executor.submit(get_cached_profile, username)
        return jsonify(future.result())
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/prospects/search', methods=['POST'])
def search_prospects():
    try:
        data = request.get_json()
        company_name = data.get('companyName')
        target_roles = data.get('targetRoles', [])
        
        if not company_name or not target_roles:
            return jsonify({
                "error": "Company name and target roles are required"
            }), 400

        prospects: List[Dict] = []
        seen_urls = set()

        # Try different search queries for each role
        for role in target_roles:
            # Focus on current employees but with simpler queries
            search_queries = [
                f"current {role} {company_name} site:linkedin.com/in",
                f"{role} at {company_name} site:linkedin.com/in",
                f"{company_name} {role} current site:linkedin.com/in"
            ]

            for query in search_queries:
                google_search_url = f"https://www.google.com/search?q={query.replace(' ', '+')}"
                
                headers = {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                }

                # Perform search
                response = requests.get(google_search_url, headers=headers)
                if response.status_code != 200:
                    continue

                # Parse results
                soup = BeautifulSoup(response.text, "html.parser")
                for link in soup.find_all("a", href=True):
                    url = link["href"]
                    if "linkedin.com/in/" in url and url not in seen_urls:
                        seen_urls.add(url)
                        
                        # Extract LinkedIn username and clean it
                        username = url.split("linkedin.com/in/")[1].split("&")[0].strip("/")
                        if not username or "#" in username:  # Skip invalid usernames
                            continue

                        # Get name from link text or use username as fallback
                        name = link.get_text()
                        if not name or len(name) < 2:
                            name = username.replace("-", " ").title()

                        # Extract position if available
                        position_element = link.find_next("div", class_="BNeawe")
                        position = position_element.get_text() if position_element else role

                        # Simple check for former employees in position
                        if "former" in position.lower() or "ex-" in position.lower():
                            continue

                        print(f"Found prospect: {username}")
                        prospects.append({
                            "name": name,
                            "position": position,
                            "company": company_name,
                            "linkedinUrl": f"https://www.linkedin.com/in/{username}",
                            "publicId": username
                        })

                # Add a small delay between different search queries
                time.sleep(0.5)

        if not prospects:
            return jsonify({
                "message": "No prospects found",
                "prospects": []
            }), 200

        # Remove duplicates while preserving order
        unique_prospects = []
        seen = set()
        for prospect in prospects:
            if prospect['publicId'] not in seen:
                seen.add(prospect['publicId'])
                unique_prospects.append(prospect)

        print(f"Found {len(unique_prospects)} prospects")
        return jsonify({"prospects": unique_prospects})

    except Exception as e:
        print(f"Search error: {e}")
        return jsonify({
            "error": f"Failed to search prospects: {str(e)}"
        }), 500
    
    
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)