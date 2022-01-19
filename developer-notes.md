# Developer Notes

## Files

- `extension.html` - shows up when you click the extension button
- `manifest.json` - the extension how to behave
- `background.js` - interacts with the browser
- `content.js` - is the content script that can inspect the content on the current web page

## Test plan

- Open an [article](https://docs.microsoft.com/azure/azure-functions/functions-create-your-first-function-visual-studio) on _docs.microsoft.com_:

  - Click on the **Edit** button
  - Click on the **Email Author** button
