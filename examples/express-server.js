const Emojitools = require('@slwulf/emojitools')
const express = require('express')
const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

app.post('/cli', (req, res) => {
    const {cli} = req.body
    Emojitools.fromCommandLineInput(cli, { plaintext: true })
        .then(emoji => emoji.message || emoji.writeToFile())
        .then(result => res.send(result))
        .catch(err => {
            res.status(500).send(err)
        })
})

app.listen(
    port,
    () => console.log(`Listening on port ${port}...`)
)
