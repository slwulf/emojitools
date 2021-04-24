#!/usr/bin/env node

const Emojitools = require('./index.js')
const Image = require('./models/image.js')

;(function() {
    const [,, ...input] = process.argv
    const isDebug = input.includes('--debug')

    Emojitools.fromCommandLineInput(input.join(' '))
        .then(result => result instanceof Image ? result.writeToFile() : result)
        .then(result => console.log(result))
        .catch(err => {
            if (isDebug) console.error(err)
            else console.log(`[ERROR] ${err.message}. For help: emojitools --help`)
        })
})()
