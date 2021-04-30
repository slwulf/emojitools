const Command = require('./command.js')
const ImageLoader = require('../util/image-loader.js')

class Reverse extends Command {
    static help(plaintext) {
        return plaintext
            ? `Usage: emojitools reverse <url>`
            : `*Usage:* \`emojitools reverse <url>\``
    }

    async render() {
        const image = await ImageLoader.fromUrl(this.getUrl())
        const reversed = await image.transformFrames((_, i, frames) => {
            return frames[(frames.length - 1) - i]
        })

        return reversed
    }
}

module.exports = Reverse
