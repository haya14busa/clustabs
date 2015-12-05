/// <reference path="../../typings/tsd.d.ts"/>

chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    if (request.method === 'getText') {
      sendResponse({data: document.body.innerText, method: 'getText'});
    }
  }
);

