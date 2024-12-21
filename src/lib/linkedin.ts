export async function fetchLinkedInProfile(linkedinUsername: string) {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/fetch-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: linkedinUsername,
      }),
    });

    const data = await response.json();

    // Check if the response contains an error
    if (!response.ok || data.error) {
      console.error('Profile fetch error:', data.error || 'Unknown error');
      return null;
    }

    // Return the profile data if successful
    return data;
  } catch (error) {
    console.error('Error fetching LinkedIn profile:', error);
    return null;
  }
}