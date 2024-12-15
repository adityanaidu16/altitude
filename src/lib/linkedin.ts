export async function fetchLinkedInProfile(linkedinUsername: string) {
    try {
      // Use absolute URL for the fetch call
      const response = await fetch('http://127.0.0.1:8000/api/fetch-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: linkedinUsername,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch LinkedIn profile');
      }
  
      const data = await response.json();
      console.log("LOOK HERE")
      console.log(data)
      return data;
    } catch (error) {
      console.error('Error fetching LinkedIn profile:', error);
      return null;
    }
  }