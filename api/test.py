import requests
import base64

def test_linkedin_oauth(client_id: str, client_secret: str):
    """
    Test LinkedIn OAuth token endpoint
    """
    token_url = "https://www.linkedin.com/oauth/v2/accessToken"
    
    # Create basic auth header
    auth_header = base64.b64encode(
        f"{client_id}:{client_secret}".encode()
    ).decode()
    
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": f"Basic {auth_header}"
    }
    
    # Test token endpoint with client credentials grant
    data = {
        "grant_type": "client_credentials",
        "scope": "openid profile email"
    }
    
    print("\n=== Testing Token Endpoint ===")
    try:
        response = requests.post(token_url, headers=headers, data=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    client_id = "86ejf9shizjnq0"
    client_secret = "WPL_AP1.9m1AWsFfsOxp9Su8.OBCCrA=="
    
    test_linkedin_oauth(client_id, client_secret)