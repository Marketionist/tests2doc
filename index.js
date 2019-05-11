const GoogleSpreadsheet = require('google-spreadsheet');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

// const creds = require('./client_secret.json');

async function readTestFile (directoryPath, file) {
    const readFile = promisify(fs.readFile);
    const filePath = path.join(directoryPath, file);

    try {
        const text = await readFile(filePath, 'utf8');

        console.log(text);
        return 'done';
    } catch (err) {
        return console.error('Unable to read file:', err);
    }

    // Callback style
    // fs.readFile(filePath, 'utf8', (err, text) => {
    //     if (err) {
    //         throw new Error(err.message);
    //     }
    //     console.log(text);
    // });

    // Promise style
    // await new Promise((resolve, reject) => {
    //     fs.readFile(filePath, 'utf8', (err, text) => {
    //         if (err) {
    //             return reject(err.message);
    //         }
    //         resolve(text);
    //     });
    // });
}

async function readTestDirectory () {
    const readDirectory = promisify(fs.readdir);
    const directoryPath = path.join(__dirname, 'tests');

    try {
        const files = await readDirectory(directoryPath, 'utf8');

        console.log('Files:', files);

        const testFiles = files.filter((file) => {
            // Filter out only test file with .js or .feature extensions
            return /.*\.(js|feature)$/gi.test(file);
        });

        console.log('Test files:', testFiles);

        for (const [index, file] of testFiles.entries()) {
            console.log(`Received test file ${index+1}`);
            const readingStatus = await readTestFile(directoryPath, file);
            console.log('Reading:', readingStatus);
        }
        console.log('All reading finished!');
    } catch (err) {
        return console.error('Unable to read directory:', err);
    }
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

readTestDirectory();

// accessSpreadsheet();
