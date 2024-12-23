
document.addEventListener("DOMContentLoaded", () => {
  const viewLogsButton = document.getElementById("view-logs");
  const viewAnalyticsButton = document.getElementById("view-analytics");
  const logsSection = document.getElementById("logs-section");
  const analyticsSection = document.getElementById("analytics-section");
  const logsList = document.getElementById("logs-list");
  const safeCountElem = document.getElementById("safe-count");
  const unsafeCountElem = document.getElementById("unsafe-count");

  let safeCount = 0;
  let unsafeCount = 0;
  let chartInstance = null; // To store the chart instance

  // Fetch and display recent logs
  viewLogsButton.addEventListener("click", () => {
    logsSection.style.display = "block";
    analyticsSection.style.display = "none";
    logsList.innerHTML = ""; // Clear old logs

    chrome.storage.local.get("recentChecks", (data) => {
      const recentChecks = data.recentChecks || [];
      if (recentChecks.length === 0) {
        logsList.innerHTML = "<li>No recent checks available.</li>";
      } else {
        recentChecks.forEach(({ url, isSafe }) => {
          const listItem = document.createElement("li");
          listItem.className = `url-item ${isSafe ? "safe" : "unsafe"}`;
          listItem.textContent = `${url} - ${isSafe ? "✔ Safe" : "⚠ Unsafe"}`;
          logsList.appendChild(listItem);
        });
      }
    });
  });

  // Fetch and display analytics data
  viewAnalyticsButton.addEventListener("click", () => {
    logsSection.style.display = "none";
    analyticsSection.style.display = "block";

    chrome.storage.local.get(["safeUrls", "unsafeUrls"], (data) => {
      console.log("Analytics Data Retrieved:", data);
      safeCount = data.safeUrls || 0;
      unsafeCount = data.unsafeUrls || 0;

      safeCountElem.textContent = safeCount;
      unsafeCountElem.textContent = unsafeCount;
      chrome.storage.local.set({ safeCount, unsafeCount });
      renderPieChart(safeCount, unsafeCount);
    });
  });

  // Back buttons to return to main dashboard
  document.getElementById("back-from-logs").addEventListener("click", () => {
    logsSection.style.display = "none";
  });

  document.getElementById("back-from-analytics").addEventListener("click", () => {
    analyticsSection.style.display = "none";
  });
});
