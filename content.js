

//content.js
document.addEventListener("mouseover", (event) => {
  const link = event.target.closest("a");
  if (!link) return;

  // Create a tooltip if not already present
  let tooltip = document.querySelector(".link-check-tooltip");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.className = "link-check-tooltip";
    document.body.appendChild(tooltip);
  }

  // Set initial tooltip text and styles
  tooltip.textContent = "Scanning...";
  tooltip.style.position = "absolute";
  tooltip.style.backgroundColor = "#000";
  tooltip.style.color = "#fff";
  tooltip.style.padding = "5px 10px";
  tooltip.style.borderRadius = "5px";
  tooltip.style.zIndex = 1000;

  // Position tooltip
  const rect = link.getBoundingClientRect();
  tooltip.style.top = `${rect.top + window.scrollY + rect.height + 5}px`;
tooltip.style.left = `${rect.left + window.scrollX}px`;


  // Debugging: log the hovered link
  console.log("Hovered link:", link.href);

  // Communicate with the background script
  chrome.runtime.sendMessage(
    { type: "CHECK_URL", url: link.href },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error("Message error:", chrome.runtime.lastError.message);
        tooltip.textContent = "⚠ Error: Unable to analyze the link.";
      } else if (response) {
        console.log("Background script response:", response);
        tooltip.textContent = response.isSafe
          ? "✔ This link is safe!"
          : "⚠ This link is marked unsafe!";
      } else {
        tooltip.textContent = "⚠ No response from background script!";
      }
    }
  );

  // Remove tooltip on mouseout
  link.addEventListener("mouseout", () => {
    if (tooltip) tooltip.remove();
  });
});
