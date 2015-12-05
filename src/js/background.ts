/// <reference path="../../typings/tsd.d.ts"/>

const html = 'clustabs.html';

chrome.browserAction.onClicked.addListener(() => {
  chrome.tabs.create({url: chrome.extension.getURL('clustabs.html')});
});
