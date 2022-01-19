'use strict';

webProperties.docs = {
  attribute: 'href',
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

  if (actionList && editListItem) {
    const emailAddress = `${this.getAlias()}@microsoft.com`;
    const emailListItem = document.createElement('LI');
    const title = document.querySelector('h1').innerText;
    emailListItem.innerHTML = `<a href="mailto:${emailAddress}?subject=${title}&body=${
      spineEdit.LINE_BREAK
    }${
      spineEdit.LINE_BREAK
    }${commonRules.addDivider()}${this.getPublicUrl()}" class="button  button button-clear button-sm has-inner-focus">Email Author</a>`;
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

function getRules() {
  return [
    // switch from the read-only view to the editor
    { apply: url => url.replace('/blob/', '/edit/') },

    // switch to the private repository
    { apply: url => url.replace(/\/\/(.*?)-docs\//, '//$1-docs-pr/') },
    { apply: url => commonRules.addDescription(url) },
    { apply: url => commonRules.addLineBreak(url) },
    { apply: url => commonRules.addLineBreak(url) },
    { apply: url => commonRules.addDivider(url) },
    { apply: (url, author) => commonRules.addAuthor(url, author) },
  ];
}
