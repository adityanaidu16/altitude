from linkedin_api import Linkedin

# Usage example in your test script:
if __name__ == "__main__":
    import os
    from dotenv import load_dotenv


    # Load environment variables
    load_dotenv()
    
    os.environ.clear()

    print(os.getenv('LINKEDIN_API_USERNAME'))

    load_dotenv()

    # Initialize the handler
    linkedin_handler = Linkedin(
        username=os.getenv('LINKEDIN_API_USERNAME'),
        password=os.getenv('LINKEDIN_API_PASSWORD')
    )
    print(linkedin_handler)

    # Test the profile fetch
    profile_data = linkedin_handler.get_profile('adityanaidu16')
    print(f"Profile data: {profile_data}")