const commands = require('fs').readdirSync('./commands')
        .filter(fn => fn.indexOf('command') !== 0)
        .map(fn => fn.replace('.js', ''))

require('dotenv').config()

async function EmojiTools(command, inputs, flags) {
    const isDebug = flags.hasOwnProperty('debug')
    const Command = loadCommand(command, isDebug)

    if (command === '--help') return getHelpDoc()
    if (Command.constructor.name === 'Error') throw Command

    if (flags.hasOwnProperty('help')) return getHelpDoc(Command)

    return new Command(inputs, flags).render()
}

EmojiTools.fromRaw = function(raw) {
    const [command, ...args] = raw.split(' ')
    const inputs = args.filter(a => a.indexOf('-') !== 0)
    const flags = args.filter(a => a.indexOf('-') === 0)
        .map(flag => flag.replace(/-/g, '').split('='))
        .reduce((obj, [key, val]) => {
            obj[key] = val
            return obj
        }, {})

    return EmojiTools(command, inputs, flags)
}

// TODO: this enables programattic use like `EmojiTools.Commands.Reverse(url)`
// EmojiTools.Commands = commands.reduce((obj, cmd) => {
//     const key = cmd[0].toUpperCase() + cmd.substring(1)
//     obj[key] = (url, flags = {}, inputs = []) => {
//         const Command = loadCommand(command)
//         return new Command(inputs.concat(url), flags).render()
//     }
//     return obj
// }, {})

function loadCommand(command, debug = false) {
    try {
        return require(`./commands/${command}.js`)
    } catch(err) {
        if (debug) console.error(err)
        return new Error(`Unknown command: ${command}`)
    }
}

function getHelpDoc(Command) {
    return Command
        ? Command.help()
        : '*Usage:* \`emojitools <command> [options] <url>\`\n' +
          `_Known commands:_ ${commands.join(', ')}\n` +
          '_For command options:_ `emojitools <command> --help`'
}

module.exports = EmojiTools
