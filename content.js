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
  try {
    if (!window.location.href.includes("linkedin.com"))
      throw new Error("You need to go to LinkedIn first");

    if (!window.location.href.includes("/messaging"))
      throw new Error("Please go to your LinkedIn messages");

    console.log("Starting to look for LinkedIn messages");

    // Wait for linkedin messaging tab to load
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Finding all conversations
    let conversations = document.querySelectorAll(
      "li.msg-conversation-listitem"
    );

    if (!conversations || conversations.length === 0) {
      throw new Error("No messages found. Make sure you're on the right page!");
    }
    console.log("Found this many conversations:", conversations.length);

    const messages = [];

    conversations.forEach((convo) => {
      try {
        const senderElem = convo.querySelector(
          "h3.msg-conversation-listitem__participant-names span.truncate"
        );
        const senderName = senderElem
          ? senderElem.textContent.trim()
          : "Unknown";

        const snippetElem = convo.querySelector(
          "p.msg-conversation-card__message-snippet"
        );
        const snippet = snippetElem ? snippetElem.textContent.trim() : "";

        if (!snippet) return;

        let category = "general";
        const msg = snippet.toLowerCase();

        if (msg.includes("linkedin offer")) {
          category = "spam";
        } else if (msg.includes("via linkedin")) {
          category = "general";
        }
        // Check if it's about jobs
        else if (
          msg.includes("job") ||
          msg.includes("position") ||
          msg.includes("opportunity") ||
          msg.includes("hiring") ||
          msg.includes("role") ||
          msg.includes("recruiter") ||
          msg.includes("interview") ||
          msg.includes("resume") ||
          msg.includes("cv")
        ) {
          category = "job";
        }
        // Check if it's about connections
        else if (
          msg.includes("connect") ||
          msg.includes("connection") ||
          msg.includes("network") ||
          msg.includes("add you")
        ) {
          category = "connection";
        }
        // Check if it's spam or sales
        else if (
          msg.includes("sale") ||
          msg.includes("offer") ||
          msg.includes("promotion") ||
          msg.includes("buy now") ||
          msg.includes("limited time") ||
          msg.includes("discount") ||
          msg.includes("deal") ||
          msg.includes("exclusive") ||
          msg.includes("free") ||
          msg.includes("sponsored")
        ) {
          category = "spam";
        }

        // Save this message info
        messages.push({
          sender: senderName,
          content: snippet,
          category,
        });
      } catch (innerError) {
        console.error("Had trouble with this conversation:", innerError);
      }
    });

    console.log(`Found ${messages.length} messages total`);
    if (messages.length === 0) {
      throw new Error("Couldn't find any messages to show.");
    }
    return { success: true, messages };
  } catch (error) {
    console.error("Something went wrong getting messages:", error);
    throw error;
  }
}
