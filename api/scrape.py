from typing import Dict
import http.client
import json
from functools import lru_cache
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

RAPIDAPI_KEY = os.getenv('RAPIDAPI_KEY')
RAPIDAPI_HOST = "linkedin-api8.p.rapidapi.com"

@lru_cache(maxsize=100)
def get_profile(username: str) -> Dict:
    """
    Get and process LinkedIn profile using RapidAPI with caching.
    
    Args:
        username: LinkedIn username to process
    
    Returns:
        Dictionary containing processed profile data
    """
    processed_data = {}
    
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
        profile = json.loads(response.read().decode("utf-8"))
        
        # Extract core profile information with optimized data handling
        profile_data = {
            "basic_info": {
                "name": f"{profile.get('firstName', '')} {profile.get('lastName', '')}".strip(),
                "industry": profile.get('industryName'),
                "location": (profile.get('geo', {}) or {}).get('full'),
                "headline": profile.get('headline'),
                "summary": profile.get('summary')
            }
        }
        
        # Process experience data if available
        if positions := profile.get('position', []):
            profile_data["experience"] = [
                {
                    "title": pos.get('title'),
                    "company": pos.get('companyName'),
                    "duration": f"{pos.get('start', {}).get('year', '')}-"
                              f"{pos.get('end', {}).get('year', 'Present')}",
                    "location": pos.get('location'),
                    "description": pos.get('description', '')[:200]  # Limit description length
                }
                for pos in positions[:5]  # Limit to 5 most recent experiences
            ]
        
        # Process education data if available
        if education := profile.get('educations', []):
            profile_data["education"] = [
                {
                    "school": edu.get('schoolName'),
                    "degree": edu.get('degree'),
                    "field": edu.get('fieldOfStudy'),
                }
                for edu in education
            ]
        
        # Process skills if available
        if skills := profile.get('skills', []):
            profile_data["skills"] = [
                skill.get('name') for skill in skills[:10]  # Limit to top 10 skills
            ]
        
        # Remove any None values or empty lists/dicts to reduce data size
        processed_data[username] = {
            k: v for k, v in profile_data.items()
            if v and (not isinstance(v, (list, dict)) or len(v) > 0)
        }
        
    except Exception as e:
        processed_data[username] = {"error": str(e)}
    finally:
        if 'conn' in locals():
            conn.close()
    
    return processed_data

def process_linkedin_profiles(sender: json, username: str) -> Dict:
    """
    Process LinkedIn profiles to extract relevant information in a compact format.
    
    Args:
        sender: Sender profile JSON data
        username: Target LinkedIn username
    
    Returns:
        Dictionary containing processed profile data for both users
    """
    processed_data = {}
    
    # Get the first (and only) key from the sender dict
    sender_key = next(iter(sender))
    processed_data[sender_key] = sender[sender_key]
    
    # Get cached profile data for target user
    target_data = get_profile(username)
    processed_data[username] = target_data[username]
    
    return processed_data

def compare_profiles(sender: object, username2: str) -> Dict:
    """
    Compare two LinkedIn profiles and return processed data.
    
    Args:
        sender: Sender LinkedIn profile object
        username2: Second LinkedIn username
    
    Returns:
        Dictionary containing processed data for both profiles
    """
    try:
        return process_linkedin_profiles(sender, username2)
    except Exception as e:
        return {"error": f"Failed to retrieve profiles: {str(e)}"}