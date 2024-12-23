
const API_KEY = "c108ea27424f08861e7bba7ed4058ee0a4f80ccdd22d02dbfe5cadd255991376"; // Your API Key

// Function to check if a URL is safe using VirusTotal API
async function checkUrlSafety(url) {
  const endpoint = `https://www.virustotal.com/api/v3/urls/${encodeURIComponent(btoa(url))}`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'x-apikey': API_KEY
      }
    });

    if (response.status === 404) {
      // If the URL is not found in the database, show a warning message
      const resultMessageElement = document.getElementById("resultMessage");
      resultMessageElement.innerHTML = `The URL is not found in the VirusTotal database. It might be <strong>malicious</strong>.`;
      resultMessageElement.style.color = "orange";
      return;
    }

    if (!response.ok) {
      throw new Error('Failed to fetch URL analysis');
    }

    const data = await response.json();
    const safetyScore = data.data.attributes.last_analysis_stats.malicious;

    // Display the result on the screen
    const resultMessageElement = document.getElementById("resultMessage");

    if (safetyScore > 0) {
      resultMessageElement.innerHTML = `The URL is <strong>malicious</strong>! ${safetyScore} detection(s) found.`;
      resultMessageElement.style.color = "red";
    } else {
      resultMessageElement.innerHTML = `The URL is <strong>safe</strong>. No malicious detections found.`;
      resultMessageElement.style.color = "green";
    }
  } catch (error) {
    const resultMessageElement = document.getElementById("resultMessage");
    resultMessageElement.innerHTML = `Error: ${error.message}`;
    resultMessageElement.style.color = "orange";
  }
}

// Event listener for the Analyze URL button
document.getElementById("searchButton").addEventListener("click", () => {
  const url = document.getElementById("searchInput").value.trim();
  const resultMessageElement = document.getElementById("resultMessage");

  // Clear previous message
  resultMessageElement.innerHTML = '';

  if (url) {
    checkUrlSafety(url);
  } else {
    resultMessageElement.innerHTML = "Please enter a URL to analyze.";
    resultMessageElement.style.color = "orange";
  }
});
