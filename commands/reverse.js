const Command = require('./command.js')
const ImageLoader = require('../util/image-loader.js')
const ImageUploader = require('../util/image-uploader.js')

class Reverse extends Command {
    static help() {
        return `*Usage:* \`emojitools reverse <url>\``
    }

    async render() {
        const image = await ImageLoader.fromUrl(this.getUrl())
        const reversed = await image.transformFrames((_, i, frames) => {
            return frames[(frames.length - 1) - i]
        })

        return ImageUploader.upload(reversed)
    }
}

module.exports = Reverse
