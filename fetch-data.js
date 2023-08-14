const fetch = require('node-fetch'); // Import the fetch library

async function fetchData() {
  const url = 'https://api.github.com/users/Mohitkoley/repos'; // Replace with your API endpoint URL
  const token = process.env.MY_TOKEN; // Access the secret as an environment variable

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`, // Include the token as a Bearer token
      'Content-Type': 'application/json',
    },
  });

  if (response.ok) {
    const data = await response.json();
    console.log('Fetched data:', data);
  } else {
    console.error('Failed to fetch data');
  }
}
module.exports = { fetchData };

fetchData();
