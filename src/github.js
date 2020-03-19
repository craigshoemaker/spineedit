'use strict';

webProperties.github = {
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
      author = el['innerText'];
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
};
