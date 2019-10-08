'use strict';

const GA_ACCOUNT_KEY = '{GA_ACCOUNT_KEY}';

function sendMessage(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const tab = tabs[0];
    if (tab) {
      const id = tab.id;
      chrome.tabs.sendMessage(id, message);
    }
  });
}

const actions = {
  log: message => {

    /*
      message
        - action: Always equals 'log' in this function
        - url:    The public URL of the published article
        - source: Domain hostname, for example: 'docs.microsoft.com' or 'github.com'
      };
    */

    console.log(message);
  }
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  sendMessage({ action: 'load' });
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {
              hostEquals: 'docs.microsoft.com',
            },
          }),
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {
              hostEquals: 'github.com',
            },
          })
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()],
      },
    ]);
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (actions[request.action]) {
    actions[request.action](request);
  }
});