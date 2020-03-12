const fs = require('fs')
const readline = require('readline')
const cliProgress = require('cli-progress')

let EXCLUDED_PATTERNS = []

const traversePath = entryPath => {
    let items = []
    const recurseItems = (currentItem) => {
        if (isFile(currentItem)) {
            items.push(currentItem)
        } else if (isDirectory(currentItem)) {
            const dir = fs.readdirSync(currentItem)
            dir.forEach(item => {
                if (!isExcluded(item)) recurseItems(`${currentItem}/${item}`)
            })
        }
    }
    recurseItems(entryPath)
    return items
}

const parseFile = async fileName => {
    const whiteSpaceOnLines = []
    const fileStream = fs.createReadStream(fileName)
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    })

    let lineNumber = 0
    for await (const line of rl) {
        if (line.endsWith(' ')) whiteSpaceOnLines.push(lineNumber)
        lineNumber = lineNumber + 1
    }

    return whiteSpaceOnLines
}

const parsePath = async (entryPath, options) => {

    if (options && options.exclude) {
        EXCLUDED_PATTERNS.push(...options.exclude.split(/,/g))
    }

    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
    const items = traversePath(entryPath)
    let effectedFiles = {}
    let itemNumber = 1

    progressBar.start(items.length, 0)
    for (const file of items) {
        progressBar.update(itemNumber)
        const whiteSpaces = await parseFile(file)
        if (whiteSpaces.length > 0) {
            effectedFiles = {
                ...effectedFiles,
                [file]: whiteSpaces
            }
        }
        itemNumber = itemNumber + 1
    }
    progressBar.stop()
    return effectedFiles
}

const isFile = pathName => fs.lstatSync(pathName).isFile()
const isDirectory = pathName => fs.lstatSync(pathName).isDirectory()
const isExcluded = pathName => EXCLUDED_PATTERNS.some(pattern => pathName.match(pattern))

module.exports = {
    parsePath
}