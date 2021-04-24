const Bolt = require('@slack/bolt')
const Emojitools = require('@slwulf/emojitools')

const app = new Bolt.App({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    token: process.env.SLACK_BOT_TOKEN
})

app.command('/emojitools', async ({ command, ack, say }) => {
    await ack()

    const image = await Emojitools.fromCommandLineInput(command.text)

    // do something with image

    await say('Done!');
})

