'use strict';

window.webProperties = window['webProperties'] || {};
let webProperty;

window.spineEdit = {
  LINE_BREAK: '%0A',
  COLON: '%3A',
  SPACE: '%20',
  AT_SIGN: '%40',
};

window.commonRules = {
  addDescription: url => `${url}?description=`,
  addLineBreak: url => `${url}${spineEdit.LINE_BREAK}`,
  addDivider: url => {
    if (!url) {
      url = '';
    }
    return `${url}-------${spineEdit.LINE_BREAK}`;
  },
  addAuthor: (url, author) => {
    const { COLON, SPACE, AT_SIGN } = spineEdit;
    if (author.length > 0) {
      author = `cc${COLON}${SPACE}${AT_SIGN}${author}`;
    }
    return `${url}${author}`;
  },
};

const getWebPropertyKey = (url, hostname) => {
  let returnValue = '';

  if (hostname === 'github.com') {
    returnValue = 'github';
  } else if (hostname === 'docs.microsoft.com') {
    if (/\/learn\//.test(url)) {
      returnValue = 'learn';
    } else {
      returnValue = 'docs';
    }
  }

  return returnValue;
};

window.webProperties.commonCustomizations = {
  updateExistingLink: webProperty => {
    const anchors = document.querySelectorAll(webProperty.selector);
    [].forEach.call(anchors, a => {
      const author = webProperty.getAuthor();
      let url = a.getAttribute(webProperty.attribute);
      webProperty.rules.forEach(rule => {
        url = rule.apply(url, author);
      });
      a.setAttribute('href', url);
      a.setAttribute('target', '_blank');
      a.addEventListener('click', (/* e */) => {
        const message = {
          action: 'log',
          url: webProperty.getPublicUrl(),
          source: window.location.hostname,
        };
        chrome.runtime.sendMessage(message);
      });
    });
  },
};

const transformation = {
  run: (webProperty, request) => {
    if (webProperty.isMatch(window.location.pathname)) {
      webProperty.customize();
      chrome.runtime.sendMessage({
        action: 'loadComplete',
        id: request.id,
      });
    }
  },
};

const load = request => {
  const key = getWebPropertyKey(window.location.href, window.location.hostname);
  webProperty = webProperties[key];
  if (webProperty) {
    transformation.run(webProperty, request);
  }
};

const actions = {
  activated: request => load(request),
  updateComplete: request => load(request),
};

chrome.runtime.onMessage.addListener(request => {
  if (actions[request.action]) {
    actions[request.action](request);
  }
});
