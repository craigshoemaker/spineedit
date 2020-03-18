'use strict';

let webProperty;

const LINE_BREAK = '%0A';
const COLON = '%3A';
const SPACE = '%20';
const AT_SIGN = '%40';

const commonRules = {
  addDescription: url => `${url}?description=`,
  addLineBreak: url => `${url}${LINE_BREAK}`,
  addDivider: url => {
    if (!url) {
      url = '';
    }
    return `${url}-------${LINE_BREAK}`;
  },
  addAuthor: (url, author) => {
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

const webProperties = {
  commonCustomizations: {
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
  },

  docs: {
    isMatch: () => true,
    selector: `a[data-original_content_git_url]`,
    attribute: 'data-original_content_git_url',
    getPublicUrl: () => window.location.href,
    getAuthor: function() {
      return this.getMetaValue('author');
    },
    getAlias: function() {
      return this.getMetaValue('ms.author');
    },
    getMetaValue: name => {
      let value = '';
      const el = document.querySelector(`meta[name="${name}"]`);
      if (el) {
        value = el.getAttribute('content');
      }
      return value;
    },
    customize: function() {
      webProperties.commonCustomizations.updateExistingLink(webProperties.docs);
      const body = document.querySelector('body');
      const attribute = 'data-spineedit';
      const isProcessed = !!body.getAttribute(attribute);

      if (!isProcessed) {
        body.setAttribute(attribute, true);
        const actionList = document.querySelector('.action-list');
        const editListItem = document.querySelector('#contenteditbtn');

        if (actionList && editListItem) {
          const emailAddress = `${this.getAlias()}@microsoft.com`;
          const emailListItem = document.createElement('LI');
          const title = document.querySelector('h1').innerText;
          emailListItem.innerHTML = `<a href="mailto:${emailAddress}?subject=${title}&body=${LINE_BREAK}${LINE_BREAK}${commonRules.addDivider()}${this.getPublicUrl()}" class="button is-text has-inner-focus is-small is-icon-only-touch">Email Author</a>`;
          actionList.insertBefore(emailListItem, editListItem);
        }
      }
    },
    rules: [
      // switch from the read-only view to the editor
      { apply: url => url.replace('/blob/', '/edit/') },

      // switch from the live branch to the master branch
      { apply: url => url.replace('/live/', '/master/') },

      { apply: url => commonRules.addDescription(url) },
      { apply: url => commonRules.addLineBreak(url) },
      { apply: url => commonRules.addLineBreak(url) },
      { apply: url => commonRules.addDivider(url) },
      { apply: (url, author) => commonRules.addAuthor(url, author) },
    ],
  },

  learn: {
    getUrl: gitHubUrl => {
      let value = gitHubUrl.replace(/\/blob\//, '/edit/');
      value = value.replace(/\/live\//, '/master/');
      if (!/index\.yml/.test(gitHubUrl)) {
        value = value.replace(/(.*\/)(.*)\.yml/, '$1includes/$2.md');
      }
      return value;
    },
    isMatch: () => true,
    selector: `meta[name="original_ref_skeleton_git_url"]`,
    attribute: 'content',
    getPublicUrl: () => window.location.href,
    getAuthor: function() {
      return this.getMetaValue('author');
    },
    getAlias: function() {
      return this.getMetaValue('ms.author');
    },
    getMetaValue: name => {
      let value = '';
      const el = document.querySelector(`meta[name="${name}"]`);
      if (el) {
        value = el.getAttribute('content');
      }
      return value;
    },
    customize: function() {
      const body = document.querySelector('body');
      const attribute = 'data-spineedit';
      const isProcessed = !!body.getAttribute(attribute);

      if (!isProcessed) {
        body.setAttribute(attribute, 'true');
        const actionList = document.querySelector('.action-list');
        const firstLI = document.querySelector('ul.action-list:first-child li');
        const listButton = firstLI.querySelector('button');

        if (actionList && firstLI) {
          const editListItem = document.createElement('LI');
          const editButton = document.createElement('A');
          editButton.setAttribute('class', listButton.getAttribute('class'));
          editButton.innerText = 'Edit';

          const gitHubUrlMeta = document.querySelector(webProperties.learn.selector);
          const gitHubUrl = gitHubUrlMeta.getAttribute(webProperties.learn.attribute);
          const learnUrl = webProperties.learn.getUrl(gitHubUrl);
          editButton.setAttribute('href', learnUrl);
          editButton.setAttribute('target', '_blank');
          editListItem.appendChild(editButton);
          actionList.insertBefore(editListItem, firstLI);
        }
      }
    },
    rules: [{ apply: url => url }],
  },

  github: {
    isMatch: pathname => /MicrosoftDocs/.test(pathname),
    selector: 'a[href^="https://github.com/Microsoft"][href*="/blob/"]',
    attribute: 'href',
    getPublicUrl: () => {
      let url = '';
      const a = document.querySelector('a[href^="https://docs.microsoft.com"]');
      if (a) {
        url = a.getAttribute('href');
      }
      return url;
    },
    getAuthor: () => {
      let author = '';
      const el = document.querySelector('.user-mention');
      if (el) {
        author = el.innerText;
        author = author.replace('@', '');
      }
      return author;
    },
    customize: () => webProperties.commonCustomizations.updateExistingLink(webProperties.github),
    rules: [
      // The GitHub template sometimes doesn't do this replacement on the server
      // and other times it does, so handling the redirect here for stability
      { apply: url => url.replace('/github.com/Microsoft/', '/github.com/MicrosoftDocs/') },

      // switch localized repos to English
      { apply: url => url.replace(/\.[a-zA-Z]{2}-[a-zA-Z]{2}\//, '/') },

      // switch from read-only view to the editor
      { apply: url => url.replace('/blob/', '/edit/') },

      // switch to the private repository
      { apply: url => url.replace(/\/(.*)-docs\//, '$1-docs-pr/') },
      { apply: url => commonRules.addDescription(url) },

      { apply: url => commonRules.addLineBreak(url) },
      { apply: url => commonRules.addLineBreak(url) },
      { apply: url => commonRules.addDivider(url) },

      { apply: (url, author) => commonRules.addAuthor(url, author) },

      { apply: url => commonRules.addLineBreak(url) },

      // Add source GitHub issue URL
      { apply: url => url + encodeURI(`GitHub Issue: ` + window.location.href) },

      // Remove base URL
      { apply: url => url.replace(/https?:\/\/?github.com/, '') },
    ],
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
