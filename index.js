'use strict';

const { readTestDirectory, writeSpreadsheet } = require('./utils/helpers.js');

module.exports = {

    exportTestCases: async function () {
        let testCasesFinal = await readTestDirectory();

        console.log('Starting to write %d test cases...', testCasesFinal.length);

        await writeSpreadsheet(testCasesFinal);

        console.log('All writing finished!');
    }

};
