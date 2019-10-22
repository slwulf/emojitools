const https = require('https')
const jimp = require('jimp')
const {GifUtil, GifFrame, BitmapImage} = require('gifwrap')
const Image = require('../util/image.js')

module.exports = {
    async fromUrl(url) {
        const jimg = await jimp.read(url)

        if (jimg.getMIME() === jimp.MIME_GIF) {
            return Image.fromGif(await loadGif(url))
        }

        const frame = new GifFrame(new BitmapImage(jimg.bitmap))
        GifUtil.quantizeWu(frame)

        return Image.fromGifFrame(frame)
    }
}

function loadGif(url) {
    return new Promise((resolve, reject) => {
        https.get(url, res => {
            let data = []
            res.on('data', chunk => data.push(chunk))
            // TODO: handle errors w/ reject here
            res.on('end', () => {
                let buffer = Buffer.concat(data)
                resolve(GifUtil.read(buffer))
            })
        })
    })
}
