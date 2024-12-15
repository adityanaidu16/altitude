from linkedin_api import Linkedin
from typing import Dict, List, Optional
import json


def process_linkedin_profiles(api: Linkedin, sender: json, username: str) -> Dict:
    """
    Process LinkedIn profiles to extract relevant information in a compact format.
    
    Args:
        api: Authenticated LinkedIn API instance
        usernames: List of LinkedIn usernames to process
    
    Returns:
        Dictionary containing processed profile data
    """
    processed_data = {}
    # Get the first (and only) key from the sender dict
    sender_key = next(iter(sender))
    processed_data[sender_key] = sender[sender_key]
    
    processed_data[username] = get_profile(api, username)
    return processed_data


def get_profile(api: Linkedin, username: str) -> Dict:
    processed_data = {}
    
    try:
        profile = api.get_profile(username)
        contact = api.get_profile_contact_info(username)
        
        # Extract core profile information
        profile_data = {
            "basic_info": {
                "name": f"{profile.get('firstName', '')} {profile.get('lastName', '')}",
                "industry": profile.get('industryName'),
                "location": profile.get('geoLocationName'),
                "headline": profile.get('headline'),
                "email": contact.get('email_address'),
            },
            
            "experience": [
                {
                    "title": exp.get('title'),
                    "company": exp.get('companyName'),
                    "duration": f"{exp.get('timePeriod', {}).get('startDate', {}).get('year', '')}-"
                                f"{exp.get('timePeriod', {}).get('endDate', {}).get('year', 'Present')}",
                    "location": exp.get('locationName'),
                    "description": exp.get('description', '')[:200]  # Limit description length
                }
                for exp in profile.get('experience', [])[:5]  # Limit to 5 most recent experiences
            ],
            
            "education": [
                {
                    "school": edu.get('schoolName'),
                    "degree": edu.get('degreeName'),
                    "field": edu.get('fieldOfStudy'),
                }
                for edu in profile.get('education', [])
            ],
            
            "skills": [
                skill.get('name') for skill in profile.get('skills', [])[:10]  # Limit to top 10 skills
            ],
            
            "honors": [
                {
                    "title": honor.get('title'),
                    "issuer": honor.get('issuer'),
                    "year": honor.get('issueDate', {}).get('year')
                }
                for honor in profile.get('honors', [])[:5]  # Limit to 5 most significant honors
            ]
        }
        
        # Remove any None values or empty lists/dicts to reduce token count
        processed_data[username] = {
            k: v for k, v in profile_data.items() 
            if v and (not isinstance(v, (list, dict)) or len(v) > 0)
        }
        
    except Exception as e:
        processed_data[username] = {"error": str(e)}
    
    return processed_data

# Example usage:
def compare_profiles(sender: object, username2: str, api_username: str, api_password: str) -> Dict:
    """
    Compare two LinkedIn profiles and return processed data.
    
    Args:
        sender: Sender LinkedIn profile object
        username2: Second LinkedIn username
        api_username: LinkedIn API username
        api_password: LinkedIn API password
    
    Returns:
        Dictionary containing processed data for both profiles
    """
    try:
        api = Linkedin(api_username, api_password)
        return process_linkedin_profiles(api, sender, username2)
    except Exception as e:
        return {"error": f"Failed to authenticate or retrieve profiles: {str(e)}"}