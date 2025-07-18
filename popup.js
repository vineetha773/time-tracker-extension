// Wait for the popup DOM to load before running any script
document.addEventListener("DOMContentLoaded", () => {
  // Get references to the DOM elements in popup.html
  const list = document.getElementById("list");
  const resetBtn = document.getElementById("resetBtn");
  const openDashboardBtn = document.getElementById("openDashboard");

  /**
   * Load time tracking data from Chrome's local storage
   * and display it in the popup UI
   */
  chrome.storage.local.get("timeData", (result) => {
    const data = result.timeData || {}; // fallback to empty object
    list.innerHTML = ""; // Clear previous content

    // Define known productive and unproductive websites
    const productiveSites = ["chat.openai.com", "chatgpt.com", "leetcode.com"];
    const unproductiveSites = ["youtube.com", "instagram.com", "facebook.com"];

    // Show a message if no time has been tracked yet
    if (Object.keys(data).length === 0) {
      list.innerHTML = '<p class="empty-msg">No time tracked yet.</p>';
      return;
    }

    // Loop through each tracked website
    for (const [url, seconds] of Object.entries(data)) {
      let tag = "";

      // Assign a tag based on website category
      if (productiveSites.some(site => url.includes(site))) {
        tag = "<span class='tag'>✅ Productive</span>";
      } else if (unproductiveSites.some(site => url.includes(site))) {
        tag = "<span class='tag'>❌ Unproductive</span>";
      } else {
        tag = "<span class='tag'>🔍 Neutral</span>";
      }

      // Append entry to the list
      list.innerHTML += `
        <div class="site-entry">
          <div>${url}</div>
          <div>${(seconds / 60).toFixed(1)} min ${tag}</div>
        </div>
      `;
    }
  });

  /**
   * Reset button: Clears time tracking data from storage
   * and shows a success message in the UI
   */
  resetBtn.addEventListener("click", () => {
    chrome.storage.local.set({ timeData: {} }, () => {
      list.innerHTML = '<p class="empty-msg">✅ Data has been reset!</p>';
    });
  });

  /**
   * "Open Dashboard" button: Launches the full dashboard page
   * in a new Chrome tab
   */
  openDashboardBtn.addEventListener("click", () => {
    chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") });
  });
});
