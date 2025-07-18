// Keeps track of the current tab and time
let currentTab = "";
let startTime = Date.now();

/**
 * Returns the current date as YYYY-MM-DD (e.g. 2025-07-05)
 */
function getDayKey() {
  const date = new Date();
  return date.toISOString().split("T")[0];
}

/**
 * Called when the user switches tabs.
 * It records time spent on the previous tab and resets timer.
 */
chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.get(tabId, (tab) => {
    updateTime(tab.url);
    currentTab = tab.url;
    startTime = Date.now();
  });
});

/**
 * Called when a tab finishes loading.
 * Also records time and resets timer.
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.active) {
    updateTime(tab.url);
    currentTab = tab.url;
    startTime = Date.now();
  }
});

/**
 * Saves time spent on a given URL under the current day,
 * without overwriting previous days or existing entries.
 */
function updateTime(url) {
  const timeSpent = Math.floor((Date.now() - startTime) / 1000); // in seconds

  // Skip invalid or internal browser pages
  if (!url || url.startsWith("chrome://")) return;

  const today = getDayKey(); // e.g., "2025-07-05"

  chrome.storage.local.get("weeklyData", (result) => {
    const weeklyData = result.weeklyData || {};

    // Create today's entry if not exists
    if (!weeklyData[today]) weeklyData[today] = {};

    // Initialize this URL if it's the first visit today
    if (!weeklyData[today][url]) weeklyData[today][url] = 0;

    // Add the new time
    weeklyData[today][url] += timeSpent;

    // Save the updated weekly data without erasing past days
    chrome.storage.local.set({ weeklyData });
  });
}
