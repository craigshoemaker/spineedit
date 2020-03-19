'use strict';

const IS_PRODUCTION = false;
const intervals = {};
const getIntervalId = () => Math.floor(Math.random() * 10000) + 1;

const actions = {
  log: ({ action, url, source }) => {
    /*
      message
        - action: Always equals 'log' in this function
        - url:    The public URL of the published article
        - source: Domain hostname, for example: 'docs.microsoft.com' or 'github.com'
    */

    if (IS_PRODUCTION) {
      ga('send', 'event', action, url, source);
    }
  },
  loadComplete: ({ id }) => clearInterval(intervals[id]),
};

chrome.tabs.onActivated.addListener(function(tab /* , changeInfo */) {
  const id = getIntervalId();
  intervals[id] = setInterval(function() {
    chrome.tabs.sendMessage(tab.tabId, {
      action: 'activated',
      origin: 'activated',
      id,
    });
  }, 500);
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo /*, tab */) {
  if (changeInfo.status === 'complete') {
    const id = getIntervalId();
    intervals[id] = setInterval(function() {
      chrome.tabs.sendMessage(tabId, {
        action: 'updateComplete',
        id,
      });
    }, 500);
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [createCondition('docs.microsoft.com'), createCondition('github.com')],
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
