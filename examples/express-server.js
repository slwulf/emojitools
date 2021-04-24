const Emojitools = require('@slwulf/emojitools')
const express = require('express')
const ImageUploader = require('./path/to/image/uploader.js')
const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

app.post('/cli', (req, res) => {
    const {cli} = req.body
    Emojitools.fromCommandLineInput(cli)
        .then(image => ImageUploader.upload(image))
        .then(result => res.send(result))
        .catch(err => {
            res.status(500).send(err)
        })
})

app.listen(
    port,
    () => console.log(`Listening on port ${port}...`)
)
