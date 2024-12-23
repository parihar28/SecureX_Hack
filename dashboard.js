
document.addEventListener("DOMContentLoaded", () => {
  const logsList = document.getElementById("logs-list");
  const totalScannedElem = document.getElementById("total-scanned");
  const analyticsChartElem = document.getElementById("analytics-chart");

  // Fetch logs and display
  chrome.storage.local.get(["recentChecks", "totalScanned", "safeUrls", "unsafeUrls"], (data) => {
    // Display Recent Logs
    const recentChecks = data.recentChecks || [];
    if (recentChecks.length === 0) {
      const emptyMessage = document.createElement("li");
      emptyMessage.textContent = "No recent logs.";
      logsList.appendChild(emptyMessage);
    } else {
      recentChecks.forEach(({ url, isSafe }) => {
        const logItem = document.createElement("li");
        logItem.className = `url-item ${isSafe === true ? "safe" : isSafe === false ? "unsafe" : "unknown"}`;
        logItem.innerHTML = `
          <div class="url">${url}</div>
          <div>${isSafe === true ? "✔ Safe" : isSafe === false ? "⚠ Unsafe" : "❓ Unknown"}</div>
        `;
        logsList.appendChild(logItem);
      });
    }

    // Display Total Scanned URLs
    totalScannedElem.textContent = data.totalScanned || 0;

    // Generate Analytics Chart
    const safeUrls = data.safeUrls || 0;
    const unsafeUrls = data.unsafeUrls || 0;
    const chartData = {
      labels: ["Safe URLs", "Unsafe URLs"],
      datasets: [
        {
          label: "URL Safety",
          data: [safeUrls, unsafeUrls],
          backgroundColor: ["#2e7d32", "#c62828"],
        },
      ],
    };

    new Chart(analyticsChartElem, {
      type: "pie",
      data: chartData,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
        },
      },
    });
  });
});
