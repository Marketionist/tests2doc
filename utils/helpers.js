'use strict';

const GoogleSpreadsheet = require('google-spreadsheet');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const ERROR_READING_FILE = 'Unable to read %s file:';
const WRONG_CLIENT_SECRET_PATH = 'Please provide path to your client_secret.json file by setting CLIENT_SECRET_PATH ' +
    'parameter';
const WRONG_TESTS_FOLDER_PATH = 'Please provide path to your tests folder by setting TESTS_FOLDER_PATH parameter';

let pathFromNodeModules = process.env.LOCAL_PACKAGE_PATH || './../../../';

// Check if CLIENT_SECRET_PATH parameter is set
if (!process.env.CLIENT_SECRET_PATH) {
    console.log(WRONG_CLIENT_SECRET_PATH);
    process.exit(1);
}

// Check if TESTS_FOLDER_PATH parameter is set
if (!process.env.TESTS_FOLDER_PATH) {
    console.log(WRONG_TESTS_FOLDER_PATH);
    process.exit(1);
}

let internalFunctions = {

    capitalizeFirstLetter: function (textLine) {
        return textLine.charAt(0).toUpperCase() + textLine.slice(1);
    }

};

let serviceFunctions = {

    readTestFile: async function (directoryPath, file) {
        const readFile = promisify(fs.readFile);
        const filePath = path.join(directoryPath, file);
        const fileExtension = path.extname(file);

        if (fileExtension === '.js') {
            try {
                const text = await readFile(filePath, 'utf8');

                let testCasesJS = text.split('\n').filter((textLine, index) => {
                    // Filter out only test cases that start from "it("
                    return (/it\((.*)/gi).test(textLine);
                }).map((textLine, index) => {
                    // Remove `it('`, `it("` from the line start
                    // and `', function`, `", function`, `', ()`, `", ()`, etc. from the line ending
                    let textLineProcessed = textLine.trim()
                        .replace(/it\(('|")/, '')
                        .replace(/('|"),\s?(function\s?(.*)|\((.*)\))\s?(.*)/, '');

                    // Capitalize first letter
                    return internalFunctions.capitalizeFirstLetter(textLineProcessed);
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
                    return (/Scenario: (.*)/gi).test(textLine);
                }).map((textLine, index) => {
                    let textLineProcessed = textLine.trim().replace('Scenario: ', '');

                    // Capitalize first letter
                    return internalFunctions.capitalizeFirstLetter(textLineProcessed);
                });

                console.log(testCasesFeature);

                return testCasesFeature;
            } catch (err) {
                return console.error(ERROR_READING_FILE, filePath, err);
            }
        } else {
            return console.error(ERROR_READING_FILE, filePath);
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

};

module.exports = {

    writeSpreadsheet: async function (arrayTestCases) {
        const creds = require(path.join(__dirname, pathFromNodeModules, process.env.CLIENT_SECRET_PATH));
        // Create a document object using the ID of the spreadsheet - obtained from its URL
        const doc = new GoogleSpreadsheet('1PFFjtefXMDdNgBi44pVfciHy2DT5bF_fI1jj4ZqsRGA');

        await promisify(doc.useServiceAccountAuth)(creds);
        const docInfo = await promisify(doc.getInfo)();
        let sheetFirst = docInfo.worksheets[0];
        let numberOfTestCases = arrayTestCases.length + 1;
        let txtHeaderNumber = '#';

        console.log(`Loaded doc: "${docInfo.title}" by ${docInfo.author.email}`);
        console.log(`Loaded ${docInfo.worksheets.length} sheets:`);
        docInfo.worksheets.map((value, index) => {
            console.log(`Sheet ${index}: "${value.title}" with size ${value.rowCount}x${value.colCount}`);
        });

        // Change a sheet's title
        await promisify(sheetFirst.setTitle)('Test cases'); // async

        // Resize a sheet
        await promisify(sheetFirst.resize)({ rowCount: numberOfTestCases, colCount: 10 }); // async

        let cellsHeader = await promisify(sheetFirst.getCells)({
            'min-row': 1,
            'max-row': 1,
            'min-col': 1,
            'max-col': 5,
            'return-empty': true
        });

        if (cellsHeader[0].value !== txtHeaderNumber) {
            // Set texts for header row
            await promisify(sheetFirst.setHeaderRow)([txtHeaderNumber, 'Test case', 'Priority', 'Status']); // async
        }

        // // Bulk updates make it easy to update many cells at once
        // let cellsHeader = await promisify(sheetFirst.getCells)({
        //     'min-row': 1,
        //     'max-row': 1,
        //     'min-col': 1,
        //     'max-col': 5,
        //     'return-empty': true
        // });

        // cellsHeader[0].value = '#';
        // cellsHeader[1].value = 'Test case';
        // cellsHeader[2].value = 'Priority';
        // cellsHeader[3].value = 'Status';
        // cellsHeader[4].formula = '=A1+B1';
        // await sheetFirst.bulkUpdateCells(cellsHeader); //async

        let cellsNumber = await promisify(sheetFirst.getCells)({
            'min-row': 1,
            'max-row': numberOfTestCases,
            'min-col': 1,
            'max-col': 1,
            'return-empty': true
        });

        cellsNumber.forEach((cell, index) => { if (cell.value !== txtHeaderNumber) { cell.value = index; } });
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

        return arrayTestCases;
    },

    readTestDirectory: async function () {
        const readDirectory = promisify(fs.readdir);
        const directoryPath = path.join(__dirname, pathFromNodeModules, process.env.TESTS_FOLDER_PATH);
        let testCasesAccumulator = [];

        try {
            const files = await readDirectory(directoryPath, 'utf8');

            console.log('Files:', files);

            const testFiles = files.filter((file) => {
                // Filter out only test file with .js or .feature extensions
                return (/.*\.(js|feature)$/gi).test(file);
            });

            console.log('Test files:', testFiles);

            for (const [index, file] of testFiles.entries()) {
                console.log(`========\nReceived test file ${index + 1}`);
                let testCases = await serviceFunctions.readTestFile(directoryPath, file);

                testCasesAccumulator = testCasesAccumulator.concat(testCases);
                console.log('Final number of test cases:', testCasesAccumulator.length);
            }

            console.log('All reading finished!');

            return testCasesAccumulator;
        } catch (err) {
            return console.error('Unable to read directory:', err);
        }
    }

};
