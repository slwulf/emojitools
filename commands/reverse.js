const Command = require('./command.js')
const Image = require('../models/image.js')
const ImageUploader = require('../util/image-uploader.js')

class Reverse extends Command {
    static help() {
        return `*Usage:* \`emojitools reverse <url>\``
    }

    async render() {
        const image = await Image.fromUrl(this.getUrl())
        const reversed = await image.transformFrames((_, i, frames) => {
            return frames[(frames.length - 1) - i]
        })

        return ImageUploader.upload(reversed)
    }
}

module.exports = Reverse
