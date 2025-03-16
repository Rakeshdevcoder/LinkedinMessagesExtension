chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.action === "fetchMessages") {
    fetchLinkedInMessages()
      .then((data) => {
        sendResponse(data);
      })
      .catch((error) => {
        console.error("Oops, couldn't get messages:", error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});

// Getting all LinkedIn Messages
async function fetchLinkedInMessages() {
  if (!window.location.href.includes("linkedin.com"))
    throw new Error("You need to go to LinkedIn first");

  if (!window.location.href.includes("/messaging"))
    throw new Error("Please go to your LinkedIn messages");

  console.log("Starting to look for LinkedIn messages");

}
