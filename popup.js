document.addEventListener("DOMContentLoaded", function () {
  const messagesContainer = document.getElementById("messages-container");
  const statusElement = document.getElementById("status");
  const refreshButton = document.getElementById("refresh-btn");
  const filterButtons = document.querySelectorAll(".filter-btn");

  let allMessages = [];
  let currentFilter = "all";

  // Load messages when popup opens
  checkLinkedInAndLoadMessages();

  refreshButton.addEventListener("click", function () {
    fetchMessagesFromLinkedIn();
  });

  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");
      currentFilter = this.getAttribute("data-filter");
      displayMessages(allMessages);
    });
  });

  // Check if user opened  LinkedIn.com  else tell user to go to linked.com website
  function checkLinkedInAndLoadMessages() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const currentTab = tabs[0];
      if (currentTab && currentTab.url.includes("linkedin.com")) {
        fetchMessagesFromLinkedIn();
      } else {
        showStatus("Please go to LinkedIn website", "error");
      }
    });
  }
});
