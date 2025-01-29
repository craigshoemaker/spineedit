'use strict';

webProperties.docs = {
  attribute: 'data-original_content_git_url',
  rules: getRules(),
  selector: `a[data-original_content_git_url]`,
  customize,
  getAlias,
  getAuthor,
  getMetaValue,
  getPublicUrl,
  isMatch: () => true,
};

/**
 * Everything below is the details
 */

function customize() {
  webProperties.commonCustomizations.updateExistingLink(webProperties.docs);

  const actionList = document.querySelector('.action-list');
  const editListItem = document.querySelector('#contenteditbtn');
  const classList = editListItem.querySelector('a').className;

  if (actionList && editListItem) {
    const emailAddress = `${this.getAlias()}@microsoft.com`;
    const emailListItem = document.createElement('LI');
    const title = document.querySelector('h1').innerText;
    emailListItem.innerHTML = `<a href="mailto:${emailAddress}?subject=${title}&body=${
      spineEdit.LINE_BREAK
    }${
      spineEdit.LINE_BREAK
    }${commonRules.addDivider()}${this.getPublicUrl()}" class="${classList}">Email Author</a>`;
    actionList.insertBefore(emailListItem, editListItem);
  }
}

function getAlias() {
  return this.getMetaValue('ms.author');
}

function getAuthor() {
  return this.getMetaValue('author');
}

function getMetaValue(name) {
  let value = '';
  const el = document.querySelector(`meta[name="${name}"]`);
  if (el) {
    value = el.getAttribute('content');
  }
  return value;
}

function getPublicUrl() {
  return window.location.href;
}

function parseUrl(url) {

  let path = '';
  let account = '';
  let repo = '';
  let branch = '';

  path = url.replace(/https?:\/\/github.com\//, '');
  path = path.replace(/\/(blob|edit)/, ''); // remove editing modes from URL
  const segments = path.split('/');

  if (segments.length > 2) {
    account = segments[0];
    repo = segments[1];
    branch = segments[2];
  }

  function getEditUrl() {
    const index = url.indexOf(branch) + branch.length + 1;
    const suffix = url.substr(index);

    const editUrl = `https://github.com/${account}/${repo}/edit/main/${suffix}`;
    return editUrl;
  }

  return {
    account,
    repo,
    branch,
    url,
    getEditUrl
  };
}

function getRules() {
  return [
    { apply: url => parseUrl(url).getEditUrl() },
    { apply: url => commonRules.addDescription(url) },
    { apply: url => commonRules.addLineBreak(url) },
    { apply: url => commonRules.addLineBreak(url) },
    { apply: url => commonRules.addDivider(url) },
    { apply: (url, author) => commonRules.addAuthor(url, author) },
  ];
}

chrome.runtime.onMessage.addListener(request => {
  if (actions[request.action]) {
    actions[request.action]();
  }
});
