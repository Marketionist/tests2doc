const GoogleSpreadsheet = require('google-spreadsheet');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

// const creds = require('./client_secret.json');

const ERROR_READING_FILE = 'Unable to read %s file:';

async function readTestFile (directoryPath, file) {
    const readFile = promisify(fs.readFile);
    const filePath = path.join(directoryPath, file);
    const fileExtension = path.extname(file);

    if (fileExtension === '.js') {
        try {
            const text = await readFile(filePath, 'utf8');

            const testCases = text.split('\n').filter((textLine, index) => {
                // Filter out only test cases that start from "it("
                return /it\((.*)/gi.test(textLine);
            }).map((textLine, index) => {
                // Remove `it('`, `it("` from the line start
                // and `', function`, `", function`, `', ()`, `", ()`, etc. from the line ending
                return (textLine.trim()
                    .replace(/it\(('|")/, '')
                    .replace(/('|"),\s?(function\s?(.*)|\((.*)\))\s?(.*)/, ''));
            });

            console.log(testCases);
            return 'done';
        } catch (err) {
            return console.error(ERROR_READING_FILE, filePath, err);
        }
    } else if (fileExtension === '.feature') {
        try {
            const text = await readFile(filePath, 'utf8');

            const testCases = text.split('\n').filter((textLine, index) => {
                // Filter out only test cases that start from "Scenario: "
                return /Scenario: (.*)/gi.test(textLine);
            }).map((textLine, index) => {
                return textLine.trim().replace('Scenario: ', '');
            });

            console.log(testCases);
            return 'done';
        } catch (err) {
            return console.error(ERROR_READING_FILE, filePath, err);
        }
    } else {
        return console.error(ERROR_READING_FILE, filePath, err);
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
            console.log(`========\nReceived test file ${index+1}`);
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
