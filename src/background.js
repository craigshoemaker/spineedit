'use strict';

const GA_ACCOUNT_KEY = '{GA_ACCOUNT_KEY}';
const IS_PRODUCTION = false;

const intervals = {
  updated: null,
  activated: null
};

// Standard Google Universal Analytics code. Replace - _AnalyticsCode with GA_ACCOUNT_KEY
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga'); // Note: https protocol here
  ga('create', GA_ACCOUNT_KEY, 'auto');
  ga('set', 'checkProtocolTask', function(){}); // Removes failing protocol check. @see: http://stackoverflow.com/a/22152353/1958200
  ga('require', 'displayfeatures');

const actions = {
  log: message => {

    /*
      message
        - action: Always equals 'log' in this function
        - url:    The public URL of the published article
        - source: Domain hostname, for example: 'docs.microsoft.com' or 'github.com'
      };
    */
   if (IS_PRODUCTION) {
     ga('send', 'event', message.action, message.url, message.source);
   }
  },
  loadComplete: message => {
    clearInterval(intervals[message.origin]);
  }
}

chrome.tabs.onActivated.addListener(function(tab, changeInfo) {
  intervals.activated = setInterval(function() {
    chrome.tabs.sendMessage(tab.tabId, {
      action: 'activated',
      origin: 'activated',
    });
  }, 500);
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if(changeInfo.status == "complete"){
    intervals.updated = setInterval(function() {
      chrome.tabs.sendMessage(tabId, { 
        action: 'updateComplete',
        origin: 'updated'
      });
    }, 500);
  }
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