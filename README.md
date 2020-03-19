<a name="introduction"></a>

![SpineEdit](images/spineedit-logo.png)

A browser extension that fosters collaboration and makes it easy to edit Microsoft docs.

## Features

When working with Microsoft docs in the browser, you can open an editor in the private repository for quick edits and collaboration.

[![Video thumbnail](images/video-thumb.png)](https://youtu.be/7yHEUnbjJHc)

## Installation

Install via the [Google web store](https://chrome.google.com/webstore/detail/spineedit/llhlgkbkfdfcbjbfnnakfpgmemopbbnf).

## Usage

After installation of the chrome extension, you will be able to easily email the author of an Azure Document by clicking the Email Author button per below.

| Website            | Click on the...       |                                                                                               |
| ------------------ | --------------------- | --------------------------------------------------------------------------------------------- |
| docs.microsoft.com | _Email Author_ button | ![Example: Click the Email Author button to open the editor](images/440x280-email-author.png) |

> **NOTE** Workflows below only work if you have access to the destination repository.

When you attempt to edit an article:

1. GitHub's page editor is opened
1. The commit description is pre-populated with the article author's GitHub username

| Website            | Click on the...                           |                                                                                         |
| ------------------ | ----------------------------------------- | --------------------------------------------------------------------------------------- |
| docs.microsoft.com | _Edit_ button                             | ![Example: Click the edit button to open the editor](images/440x280.png)                |
| github.com         | _Content Source_ link in an article issue | ![Example: Click the Content Source link to open the editor](images/440x280-github.png) |

## Known issues

- When opening links from _github.com/issues_ the _Content Source_ link doesn't open in a new tab

## Test plan

- Open an [article](https://docs.microsoft.com/en-us/azure/azure-functions/functions-create-your-first-function-visual-studio) on _docs.microsoft.com_:

  - Click on the **Edit** button
  - Click on the **Email Author** button

- On _github.com_, open links using left and right-clicks, then click on the **Content Source** link:
  - [github.com/issues/assigned](https://github.com/issues/assigned)
  - [github.com/MicrosoftDocs/azure-docs/issues](https://github.com/MicrosoftDocs/azure-docs/issues)

## Acknowledgements

Created by [Craig Shoemaker](https://github.com/craigshoemaker) and [Frank Hu](https://github.com/frankhu-msft).

Thanks to [Erika Doyle](https://github.com/erikadoyle) and [John Papa](https://github.com/johnpapa) for feedback and suggestions.

## Developer Notes

- `extension.html` - shows up when you click the extension button
- `manifest.json` - the extension how to behave
- `background.js` - interacts with the browser
- `content.js` - is the content script that can inspect the content on the current web page
