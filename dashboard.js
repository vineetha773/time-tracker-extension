document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("list");
  const resetBtn = document.getElementById("resetBtn");

  const productiveSites = ["chat.openai.com", "chatgpt.com", "leetcode.com","googlecolab.com"];
  const unproductiveSites = ["youtube.com", "instagram.com", "facebook.com"];

  chrome.storage.local.get(["weeklyData"], (result) => {
    const data = result.weeklyData || {};
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    const last7 = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const key = date.toISOString().split("T")[0];
      const label = days[date.getDay()];
      last7.push({ key, label });
    }

    let hasData = false;
    list.innerHTML = "";

    for (const { key, label } of last7) {
      const dayData = data[key];
      if (!dayData) continue;

      hasData = true;
      list.innerHTML += `<h3>📅 ${label} (${key})</h3>`;

      for (const [url, seconds] of Object.entries(dayData)) {
        const minutes = (seconds / 60).toFixed(1);
        let tag = "Neutral", tagClass = "tag-neutral";

        if (productiveSites.some(site => url.includes(site))) {
          tag = "Productive"; tagClass = "tag-productive";
        } else if (unproductiveSites.some(site => url.includes(site))) {
          tag = "Unproductive"; tagClass = "tag-unproductive";
        }

        list.innerHTML += `
          <div class="site-entry">
            <div>${url}</div>
            <div>${minutes} min <span class="tag ${tagClass}">${tag}</span></div>
          </div>
        `;
      }
    }

    if (!hasData) {
      list.innerHTML = `<p class="empty-message">No data available for the past 7 days.</p>`;
    }
  });

  resetBtn.addEventListener("click", () => {
    chrome.storage.local.set({ weeklyData: {} }, () => {
      location.reload();
    });
  });
});
