const GoogleSpreadsheet = require('google-spreadsheet');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

// const creds = require('./client_secret.json');

async function readTestFiles () {
    const readFile = promisify(fs.readFile);
    let filePath = path.join(__dirname, 'tests', 'test1.feature');

    try {
        const txt = await readFile(filePath, 'utf8');
        return console.log(txt);
    } catch (err) {
        return console.error(err);
    }

    // Callback style
    // fs.readFile(filePath, 'utf8', (err, txt) => {
    //     if (err) {
    //         throw new Error(err.message);
    //     }
    //     console.log(txt);
    // });

    // Promise style
    // await new Promise((resolve, reject) => {
    //     fs.readFile(filePath, 'utf8', (err, txt) => {
    //         if (err) {
    //             return reject(err.message);
    //         }
    //         resolve(txt);
    //     });
    // });

}

async function accessSpreadsheet () {
    const doc = new GoogleSpreadsheet('xxxx');
    await promisify(doc.useServiceAccountAuth)(creds);
    const docInfo = await promisify(doc.getInfo)();
    const sheetFirst = docInfo.worksheets[0];
    console.log(`First Sheet Title: ${sheetFirst.title}`);

    const rowsSheetFirst = await promisify(sheetFirst.getRows)({
        offset: 1
    });
    console.log(rowsSheetFirst);
}

readTestFiles();

// accessSpreadsheet();
