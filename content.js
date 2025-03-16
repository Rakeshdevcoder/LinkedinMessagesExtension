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
