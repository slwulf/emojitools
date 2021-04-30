const Emoji = require('./models/emoji.js')

const commands = require('fs').readdirSync('./commands')
        .filter(fn => fn.indexOf('command') !== 0)
        .map(fn => fn.replace('.js', ''))

async function Emojitools(command, inputs, flags, opts = {}) {
    const isDebug = flags.hasOwnProperty('debug')
    const Command = loadCommand(command, isDebug)
    const { plaintext = false } = opts

    if (command === '--help') return Emoji(getHelpDoc(null, plaintext))
    if (Command.constructor.name === 'Error') throw Command

    if (flags.hasOwnProperty('help')) return Emoji(getHelpDoc(Command, plaintext))

    return Emoji(null, await new Command(inputs, flags).render())
}

Emojitools.fromCommandLineInput = function(cli, opts = {}) {
    const [command, ...args] = cli.split(' ')
    const inputs = args.filter(a => a.indexOf('-') !== 0)
    const flags = args.filter(a => a.indexOf('-') === 0)
        .map(flag => flag.replace(/-/g, '').split('='))
        .reduce((obj, [key, val]) => {
            obj[key] = val
            return obj
        }, {})

    return Emojitools(command, inputs, flags, opts)
}

// TODO: this enables programattic use like `Emojitools.Commands.Reverse(url)`
// Emojitools.Commands = commands.reduce((obj, cmd) => {
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

function getHelpDoc(Command, plaintext) {
    const rootHelp = plaintext
        ? `
Usage: emojitools <command> [options] <url>
Known commands: ${commands.join(', ')}
For command options: emojitools <command> --help
`
        : `
*Usage:* \`emojitools <command> [options] <url>\`
_Known commands:_ ${commands.join(', ')}
_For command options:_ \`emojitools <command> --help\`
`

    return Command
        ? Command.help(plaintext).trim()
        : rootHelp.trim()
}

module.exports = Emojitools
