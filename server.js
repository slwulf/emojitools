const EmojiTools = require('./index.js')
const express = require('express')
const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

app.get('/', (req, res) => {
    res.send('hi!')
})

app.post('/cli', (req, res) => {
    const {cli} = req.body
    EmojiTools.fromRaw(cli)
        .then(result => res.send(result))
        .catch(err => {
            console.log(`Error from input: ${cli}`)
            console.error(err)
            res.status(500).send(err.message)
        })
})

app.listen(port, () => console.log(`Listening on port ${port}...`))
