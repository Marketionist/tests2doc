const GoogleSpreadsheet = require('google-spreadsheet');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const creds = require('./client_secret.json');

const ERROR_READING_FILE = 'Unable to read %s file:';

async function readTestFile (directoryPath, file) {
    const readFile = promisify(fs.readFile);
    const filePath = path.join(directoryPath, file);
    const fileExtension = path.extname(file);

    if (fileExtension === '.js') {
        try {
            const text = await readFile(filePath, 'utf8');

            let testCasesJS = text.split('\n').filter((textLine, index) => {
                // Filter out only test cases that start from "it("
                return /it\((.*)/gi.test(textLine);
            }).map((textLine, index) => {
                // Remove `it('`, `it("` from the line start
                // and `', function`, `", function`, `', ()`, `", ()`, etc. from the line ending
                return (textLine.trim()
                    .replace(/it\(('|")/, '')
                    .replace(/('|"),\s?(function\s?(.*)|\((.*)\))\s?(.*)/, ''));
            });

            console.log(testCasesJS);
            return testCasesJS;
        } catch (err) {
            return console.error(ERROR_READING_FILE, filePath, err);
        }
    } else if (fileExtension === '.feature') {
        try {
            const text = await readFile(filePath, 'utf8');

            let testCasesFeature = text.split('\n').filter((textLine, index) => {
                // Filter out only test cases that start from "Scenario: "
                return /Scenario: (.*)/gi.test(textLine);
            }).map((textLine, index) => {
                return textLine.trim().replace('Scenario: ', '');
            });

            console.log(testCasesFeature);
            return testCasesFeature;
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

async function writeSpreadsheet (arrayTestCases) {
    // Create a document object using the ID of the spreadsheet - obtained from its URL
    const doc = new GoogleSpreadsheet('1PFFjtefXMDdNgBi44pVfciHy2DT5bF_fI1jj4ZqsRGA');
    await promisify(doc.useServiceAccountAuth)(creds);
    const docInfo = await promisify(doc.getInfo)();
    let sheetFirst = docInfo.worksheets[0];
    let numberOfTestCases = arrayTestCases.length + 1;

    console.log(`Loaded doc: "${docInfo.title}" by ${docInfo.author.email}`);
    console.log(`Loaded ${docInfo.worksheets.length} sheets:`);
    docInfo.worksheets.map((value, index) => {
        console.log(`Sheet ${index}: "${value.title}" with size ${sheetFirst.rowCount}x${sheetFirst.colCount}`);
    });

    // Change a sheet's title
    await promisify(sheetFirst.setTitle)('Test cases'); // async

    // Resize a sheet
    await promisify(sheetFirst.resize)({ rowCount: numberOfTestCases, colCount: 10 }); // async

    // Set texts for header row
    await promisify(sheetFirst.setHeaderRow)(['#', 'Test case', 'Priority', 'Status']); // async

    // // Bulk updates make it easy to update many cells at once
    // let cellsHeading = await promisify(sheetFirst.getCells)({
    //     'min-row': 1,
    //     'max-row': 1,
    //     'min-col': 1,
    //     'max-col': 5,
    //     'return-empty': true
    // });

    // cellsHeading[0].value = '#';
    // cellsHeading[1].value = 'Test case';
    // cellsHeading[2].value = 'Priority';
    // cellsHeading[3].value = 'Status';
    // cellsHeading[4].formula = '=A1+B1';
    // await sheetFirst.bulkUpdateCells(cellsHeading); //async

    let cellsNumber = await promisify(sheetFirst.getCells)({
        'min-row': 1,
        'max-row': numberOfTestCases,
        'min-col': 1,
        'max-col': 1,
        'return-empty': true
    });

    cellsNumber.forEach((cell, index) => { cell.value = index; });
    await sheetFirst.bulkUpdateCells(cellsNumber);

    let cellsTestCases = await promisify(sheetFirst.getCells)({
        'min-row': 2,
        'max-row': numberOfTestCases,
        'min-col': 2,
        'max-col': 2,
        'return-empty': true
    });

    cellsTestCases.forEach((cell, index) => { cell.value = arrayTestCases[index]; });
    await sheetFirst.bulkUpdateCells(cellsTestCases);

}

async function readTestDirectory () {
    const readDirectory = promisify(fs.readdir);
    const directoryPath = path.join(__dirname, 'tests');
    let testCasesFinal = [];

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
            let testCases = await readTestFile(directoryPath, file);
            testCasesFinal = testCasesFinal.concat(testCases);
            console.log('Final number of test cases:', testCasesFinal.length);
        }

        console.log('All reading finished! Starting to write...');

        await writeSpreadsheet(testCasesFinal);

        console.log('All writing finished!');
    } catch (err) {
        return console.error('Unable to read directory:', err);
    }

}

readTestDirectory();
