document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded and parsed.");
  
    // Fetch data from Chrome local storage
    chrome.storage.local.get(["safeCount", "unsafeCount"], (data) => {
      console.log("Data fetched from Chrome storage:", data);
  
      // Retrieve safe and unsafe counts
      const safeCount = data.safeCount || 0;
      const unsafeCount = data.unsafeCount || 0;
  
      // Debug output to ensure values are fetched
      const debugInfo = `
        <p><strong>Debug Information:</strong></p>
        <p>Safe Count: ${safeCount}</p>
        <p>Unsafe Count: ${unsafeCount}</p>
      `;
      document.getElementById("debug-info").innerHTML = debugInfo;
  
      console.log("Safe Count:", safeCount, "Unsafe Count:", unsafeCount);
  
      // Check if there's any data to show
      if (safeCount === 0 && unsafeCount === 0) {
        document.getElementById("analyticsChart").outerHTML = "<p>No data available to display.</p>";
        return;
      }
  
      // Prepare data for the pie chart
      const dataValues = [safeCount, unsafeCount];
      const dataLabels = ["Safe", "Unsafe"];
      const colors = ["#4CAF50", "#FF5733"];
  
      // Draw pie chart on canvas
      const canvas = document.getElementById("analyticsChart");
      const ctx = canvas.getContext("2d");
      const total = dataValues.reduce((a, b) => a + b, 0);
      let startAngle = 0;
  
      // Set canvas size
      canvas.width = 400;
      canvas.height = 400;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 150;
  
      // Draw the pie chart
      dataValues.forEach((value, index) => {
        const sliceAngle = (value / total) * 2 * Math.PI;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = colors[index];
        ctx.fill();
        startAngle += sliceAngle;
      });
  
      // Add labels
      startAngle = 0;
      dataValues.forEach((value, index) => {
        const sliceAngle = (value / total) * 2 * Math.PI;
        const labelAngle = startAngle + sliceAngle / 2;
        const labelX = centerX + (radius / 1.5) * Math.cos(labelAngle);
        const labelY = centerY + (radius / 1.5) * Math.sin(labelAngle);
        ctx.fillStyle = "#000";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.fillText(dataLabels[index], labelX, labelY);
        startAngle += sliceAngle;
      });
  
      console.log("Pie chart created successfully.");
    });
  });
  
