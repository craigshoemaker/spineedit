'use strict';

let domain;

const LINE_BREAK = '%0A';

const commonRules = {
  addDescription: url => `${url}?description=`,
  addLineBreak: url => `${url}${LINE_BREAK}`,
  addDivider: url => `${url}-------${LINE_BREAK}`,
  addAuthor: (url, author) => {
    if (author.length > 0) {
      const colon = '%3A';
      const space = '%20';
      const ampersand = '%40';
      author = `cc${colon}${space}${ampersand}${author}`;
    }
    return `${url}${author}`;
  },
};

const domains = {
  'docs.microsoft.com': {
    isMatch: () => true,
    selector: `a[data-original_content_git_url]`,
    attribute: 'data-original_content_git_url',
    getPublicUrl: () => window.location.href,
    getAuthor: () => {
      let author = '';
      const el = document.querySelector('meta[name="author"]');
      if (el) {
        author = el.getAttribute('content');
      }
      return author;
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

  'github.com': {
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

      { apply: url => url.replace(/https?:\/\/?github.com/, '') },
    ],
  },
};

const transformation = {
  run: domain => {
    if (domain.isMatch(window.location.pathname)) {
      const anchors = document.querySelectorAll(domain.selector);
      [].forEach.call(anchors, a => {
        const author = domain.getAuthor();
        let url = a.getAttribute(domain.attribute);
        domain.rules.forEach(rule => {
          url = rule.apply(url, author);
        });
        a.setAttribute('href', url);
        a.setAttribute('target', '_blank');
        a.addEventListener('click', e => {
          const message = {
            action: 'log',
            url: domain.getPublicUrl(),
            source: window.location.hostname,
          };
          chrome.runtime.sendMessage(message);
        });
      });
    }
  },
};

const load = () => {
  domain = domains[window.location.hostname];
  if (domain) {
    transformation.run(domain);
  }
};

const actions = {
  activated: () => load(),
  updateComplete: () => load(),
};

chrome.runtime.onMessage.addListener(request => {
  if (actions[request.action]) {
    actions[request.action]();
  }
});
