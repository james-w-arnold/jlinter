#!/usr/bin/env node

const { parsePath } = require('./index')
const { table } = require('table')
const yargs = require('yargs')


const argv = yargs
    .usage('Usage: $0: <path> [options]')
    .command('$0 <path> [options]', 'Find white space in listed files', yargs => {
        yargs.positional('path', {
            describe: 'File path to traverse and search for files which have lines ending with white space',
            type: 'string',
            demandOption: "true"
        })
        .option('x', {
            alias: 'exclude',
            describe: 'A comma seperated list of patterns to exclude from the search'
        })
    })
    .help()
    .argv


parsePath(argv.path, {
    exclude: argv.x
}).then(response => {
    const resultsArray = Object.entries(response).map(([key, value]) => ([key, value]))
    
    console.log(table([['file', 'lines impacted'], ...resultsArray]))
})
