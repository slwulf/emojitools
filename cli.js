#!/usr/bin/env node

const EmojiTools = require('./index.js')

;(function() {
    const [,, ...input] = process.argv
    const isDebug = input.includes('--debug')

    EmojiTools.fromRaw(input.join(' '))
        .then(result => console.log(result))
        .catch(err => {
            if (isDebug) console.error(err)
            else console.log(`[ERROR] ${err.message}. For help: emojitools --help`)
        })
})()
