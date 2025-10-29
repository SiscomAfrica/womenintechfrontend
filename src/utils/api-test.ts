




const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function testApiConnection(): Promise<{
  success: boolean;
  url: string;
  status?: number;
  message: string;
}> {
  try {
    console.log(`🔍 Testing API connection to: ${API_URL}`);
    
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        url: API_URL,
        status: response.status,
        message: `✅ API connection successful! Backend is healthy. ${JSON.stringify(data)}`,
      };
    } else {
      return {
        success: false,
        url: API_URL,
        status: response.status,
        message: `❌ API responded with status ${response.status}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      url: API_URL,
      message: `❌ Failed to connect to API: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}


if (import.meta.env.DEV) {
  testApiConnection().then(result => {
    console.log(result.message);
  });
}