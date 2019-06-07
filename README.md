# tests2doc

[![Build Status](https://travis-ci.org/Marketionist/tests2doc.svg?branch=master)](https://travis-ci.org/Marketionist/tests2doc)
[![npm version](https://img.shields.io/npm/v/tests2doc.svg)](https://www.npmjs.com/package/tests2doc)
[![NPM License](https://img.shields.io/npm/l/tests2doc.svg)](https://github.com/Marketionist/tests2doc/blob/master/LICENSE)

Export your test cases from `.js` or `.feature` files to Google Docs Sheets.

## Supported versions
[Node.js](http://nodejs.org/):
- 8.x
- 9.x
- 10.x
- 11.x
- 12.x

## Installation
`npm install tests2doc --save`

## Importing and configuring
> You will need to enable the Google Sheets API for the project in order to access
> Spreadsheets - see [instructions and images](https://cmichel.io/how-to-access-google-spreadsheet-with-node/).

You can require tests2doc in your `.js` file and configure it like this:

```javascript
const { exportTestCases } = require('tests2doc');

exportTestCases();
```

Function `exportTestCases` returns an array of test cases and exports them to Google Sheets.

When launching the script (your `.js` file that contains `exportTestCases();`) 2 parametes should be provided:
- `CLIENT_SECRET_PATH` - string with path to your `client_secret.json` file - for
    example `CLIENT_SECRET_PATH='../secrets/client_secret.json'`;
- `TESTS_FOLDER_PATH` - string with path to your `tests` folder - for example `TESTS_FOLDER_PATH='./src/tests'`;

So it will look like:

```bash
CLIENT_SECRET_PATH='../secrets/client_secret.json' TESTS_FOLDER_PATH='./src/tests' node index.js
```


## Thanks
If this script was helpful for you, please give it a **★ Star**
on [github](https://github.com/Marketionist/tests2doc)
