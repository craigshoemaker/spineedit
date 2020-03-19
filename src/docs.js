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
  const body = document.querySelector('body');
  const attribute = 'data-spineedit';
  const isProcessed = !!body.getAttribute(attribute);

  if (!isProcessed) {
    body.setAttribute(attribute, 'true');
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
      }${commonRules.addDivider()}${this.getPublicUrl()}" class="button is-text has-inner-focus is-small is-icon-only-touch">Email Author</a>`;
      actionList.insertBefore(emailListItem, editListItem);
    }
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

    // switch from the live branch to the master branch
    { apply: url => url.replace('/live/', '/master/') },

    { apply: url => commonRules.addDescription(url) },
    { apply: url => commonRules.addLineBreak(url) },
    { apply: url => commonRules.addLineBreak(url) },
    { apply: url => commonRules.addDivider(url) },
    { apply: (url, author) => commonRules.addAuthor(url, author) },
  ];
}
