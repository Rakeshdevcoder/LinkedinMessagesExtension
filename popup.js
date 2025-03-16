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

  function fetchMessagesFromLinkedIn() {
    showStatus("Getting your messages...", "success");
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (!tabs || tabs.length === 0) {
        showStatus("No active tab found", "error");
        return;
      }

      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "fetchMessages" },
        function (response) {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            showStatus(
              "Couldn't connect to LinkedIn. Try refreshing the page.",
              "error"
            );
            return;
          }
          if (response && response.success) {
            allMessages = response.messages;
            displayMessages(allMessages);
            showStatus(`Found ${allMessages.length} messages`, "success");
          } else {
            const errorMsg = response ? response.error : "Something went wrong";
            showStatus(`Couldn't get messages: ${errorMsg}`, "error");
          }
        }
      );
    });
  }
});
