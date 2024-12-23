



//background.js
const API_KEY = "6db6f4de275faaec34178e8c736e9cf2511e674feb3e465f256154e6311516cb"; // Replace with your VirusTotal API key
const API_URL = "https://www.virustotal.com/api/v3/urls";

const cache = {};
const MAX_RECENT_CHECKS = 10; // Limit to 10 recent checks

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "CHECK_URL") {
    const url = message.url;
    // Debugging: log the original URL
    console.log("Original URL:", url);
    // Use cache if available
    if (cache[url] !== undefined) {
      console.log(`Cache hit for URL: ${url}, Is Safe: ${cache[url]}`);
      addRecentCheck(url, cache[url]);
      sendResponse({ isSafe: cache[url] });
      return true;
    }

    try {
      const encodedURL = btoa(url)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
      console.log("Encoded URL for API:", encodedURL);
      fetch(`${API_URL}/${encodedURL}`, {
        method: "GET",
        headers: { "x-apikey": API_KEY },
      })
        .then((response) => {
          console.log("API Response status:", response.status);
          if (response.status === 429) 
            {
                throw new Error("Rate limit exceeded");
            }
                      if (response.status === 404) {
                        throw new Error("URL not found in VirusTotal database");
                      }
          if (!response.ok) {
            throw new Error(`API responded with status ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("Full API Response:", data);
          const maliciousCount =
            data.data?.attributes?.last_analysis_stats?.malicious || 0;
          const harmlessCount =
            data.data?.attributes?.last_analysis_stats?.harmless || 0;

          let isSafe;
          if (maliciousCount === 0 && harmlessCount > 0) {
            isSafe = true;
          } else if (maliciousCount > 0) {
            isSafe = false;
          } else {
             //Fallback to HTTP/HTTPS check if VirusTotal is inconclusive
            if (url.startsWith("https://")) {
              isSafe = true;
            } else if (url.startsWith("http://")) {
              isSafe = false;
            } else {
              isSafe = false; // Default to unsafe
          }
        }
          cache[url] = isSafe;
          // addRecentCheck(url, isSafe);
          console.log(
                        `URL: ${url}, Safe (from API or fallback): ${isSafe ? "Yes" : "No"}`
                      );
          sendResponse({ isSafe });
        })
        .catch((error) => {
          console.error("Error during API fetch:", error.message);

          const isSafe = url.startsWith("https://");
          addRecentCheck(url, isSafe);
          console.log(
                        `URL: ${url}, Safe (fallback due to error): ${
                          isSafe ? "Yes" : "No"
                        }`
                      );
          sendResponse({ isSafe });
        });

      return true;
    } catch (error) {
      console.error("Unexpected error in background script:", error.message);
      sendResponse({ isSafe: false });
    }
  }
});


function addRecentCheck(url, isSafe) {
  chrome.storage.local.get(
    ["recentChecks", "totalScanned", "safeUrls", "unsafeUrls"],
    (data) => {
      const recentChecks = data.recentChecks || [];
      recentChecks.unshift({ url, isSafe });
      if (recentChecks.length > MAX_RECENT_CHECKS) {
        recentChecks.pop();
      }

      const totalScanned = (data.totalScanned || 0) + 1;
      const safeUrls = (data.safeUrls || 0) + (isSafe ? 1 : 0);
      const unsafeUrls = (data.unsafeUrls || 0) + (isSafe ? 0 : 1);

      chrome.storage.local.set({
        recentChecks,
        totalScanned,
        safeUrls,
        unsafeUrls,
      });
    }
  );
}
