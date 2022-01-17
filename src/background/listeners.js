'use strict';

const IS_PRODUCTION = false;

const actions = {
  log: ({ action, url, source }) => {
    /*
      message
        - action: Always equals 'log' in this function
        - url:    The public URL of the published article
        - source: Domain hostname, for example: 'docs.microsoft.com'
    */

    if (IS_PRODUCTION) {
      ga('send', 'event', action, url, source);
    }
  },
};

chrome.tabs.onActivated.addListener(function(tab /* , changeInfo */) {
  chrome.tabs.sendMessage(tab.tabId, {
    action: 'activated',
    origin: 'activated',
  });
});

chrome.tabs.onUpdated.addListener(function(tabId /* changeInfo, tab */) {
  chrome.tabs.sendMessage(tabId, {
    action: 'updateComplete',
  });
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [createCondition('docs.microsoft.com')],
        actions: [new chrome.declarativeContent.ShowPageAction()],
      },
    ]);
  });
});

chrome.runtime.onMessage.addListener((request /*, sender, sendResponse */) => {
  if (actions[request.action]) {
    actions[request.action](request);
  }
});

function createCondition(hostEquals) {
  return new chrome.declarativeContent.PageStateMatcher({ pageUrl: { hostEquals } });
}
