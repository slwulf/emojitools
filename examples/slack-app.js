const Bolt = require('@slack/bolt')
const Emojitools = require('@slwulf/emojitools')
const fs = require('fs')

const app = new Bolt.App({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    token: process.env.SLACK_BOT_TOKEN
})

app.command('/emojitools', async ({ command, ack, say }) => {
    await ack()

    const emoji = await Emojitools.fromCommandLineInput(command.text)

    if (emoji.message) return say(emoji.message)

    await app.client.files.upload({
        filename: 'my-cool-file-upload',
        file: emoji.saveToReadStream(),
        channels: [/* channel IDs */]
    })

    say('Done!');
})

