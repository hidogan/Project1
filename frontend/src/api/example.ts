const API_URL = 'http://localhost:3000';

async function fetchData() {
  const response = await fetch(`${API_URL}/api/your-endpoint`);
  return response.json();
} 