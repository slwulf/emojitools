const Bolt = require('@slack/bolt')
const Emojitools = require('@slwulf/emojitools')
const fs = require('fs')

const app = new Bolt.App({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    token: process.env.SLACK_BOT_TOKEN
})

app.command('/emojitools', async ({ command, ack, say }) => {
    await ack()

    const image = await Emojitools.fromCommandLineInput(command.text)
    const filepath = await image.writeToFile()

    await app.client.files.upload({
        filename: image.filename,
        file: fs.createReadStream(filepath),
        channels: [/* channel IDs */]
    })

    await say('Done!');
})

