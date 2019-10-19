const https = require('https')
const jimp = require('jimp')
const {GifUtil, GifFrame, BitmapImage} = require('gifwrap')

module.exports = {
    async fromUrl(url) {
        const jimg = await jimp.read(url)

        if (jimg.getMIME() === jimp.MIME_GIF) {
            let gif = await loadGif(url)
            return gif
        }

        const frame = new GifFrame(new BitmapImage(jimg.bitmap))
        GifUtil.quantizeWu(frame)

        return frame
    }
}

function loadGif(url) {
    return new Promise((resolve, reject) => {
        https.get(url, res => {
            let data = []
            res.on('data', chunk => data.push(chunk))
            res.on('end', () => {
                let buffer = Buffer.concat(data)
                resolve(GifUtil.read(buffer))
            })
        })
    })
}
