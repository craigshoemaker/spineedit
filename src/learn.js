// @ts-check
'use strict';

webProperties.learn = {
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

            let url = gitHubUrl;
            webProperties.learn.rules.forEach(rule => {
                url = rule.apply(url);
            });

            editButton.setAttribute('href', url);
            editButton.setAttribute('target', '_blank');
            editListItem.appendChild(editButton);
            actionList.insertBefore(editListItem, firstLI);
        }
        }
    },
    rules: [
        // switch to edit mode
        { apply: url => url.replace(/\/blob\//, '/edit/') },

        // switch to master branch
        { apply: url => url.replace(/\/live\//, '/master/') },

        // switch to markdown for unit files
        {
            apply: url => {
                if (!/index\.yml/.test(url)) {
                    url = url.replace(/(.*\/)(.*)\.yml/, '$1includes/$2.md');
                }
                return url;
            }
        },
    ]
};
