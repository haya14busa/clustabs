// content.js
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.method === 'getText') {
      sendResponse({data: document.body.innerText, method: 'getText'});
    }
  }
);
