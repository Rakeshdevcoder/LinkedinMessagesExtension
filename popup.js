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

  // Display messages based on current filter
  function displayMessages(messages) {
    messagesContainer.innerHTML = "";
    let filteredMessages = messages;

    if (currentFilter === "spam") {
      filteredMessages = messages.filter((msg) => msg.category === "spam");
    } else if (currentFilter === "job") {
      filteredMessages = messages.filter((msg) => msg.category === "job");
    } else if (currentFilter === "connection") {
      filteredMessages = messages.filter(
        (msg) => msg.category === "connection"
      );
    }

    if (filteredMessages.length === 0) {
      messagesContainer.innerHTML = `<p class='no-messages'>No ${
        currentFilter !== "all" ? currentFilter + " " : ""
      }messages found</p>`;
    } else {
      filteredMessages.forEach((msg) => {
        const messageElement = document.createElement("div");
        messageElement.className = `message ${msg.category}`;

        const categoryBadge = document.createElement("span");
        categoryBadge.className = `category-badge ${msg.category}`;
        categoryBadge.textContent = msg.category;

        messageElement.innerHTML = `
          <div class="message-header">
            <div class="sender">${msg.sender}</div>
          </div>
          <div class="message-content">${msg.content}</div>
        `;

        const headerDiv = messageElement.querySelector(".message-header");
        headerDiv.appendChild(categoryBadge);

        if (msg.category === "spam") {
          const deleteBtn = document.createElement("button");
          deleteBtn.className = "delete-btn";
          deleteBtn.textContent = "Delete";
          deleteBtn.addEventListener("click", function () {
            deleteConversationFromLinkedIn(msg.sender, msg.content);
            this.disabled = true;
            this.textContent = "Deleting...";
          });
          messageElement.appendChild(deleteBtn);
        }

        messagesContainer.appendChild(messageElement);
      });
    }
  }

  // Show status messages to the user
  function showStatus(message, type) {
    statusElement.textContent = message;
    statusElement.className = type;
    statusElement.style.display = "block";

    if (type === "success") {
      setTimeout(() => {
        statusElement.style.display = "none";
      }, 3000);
    }
  }
});
