const Command = require('./command.js')
const ImageLoader = require('../util/image-loader.js')
const ImageUploader = require('../util/image-uploader.js')

class Resize extends Command {
    static help() {
        return `
*Usage:* \`emojitools resize --width=<n> --height=<n> <url>\`
A width or a height must be provided.
`
    }

    defineFlags() {
        return {
            width: {
                test: n => !isNaN(n),
                message: 'Width must be a number.'
            },
            height: {
                test: n => !isNaN(n),
                message: 'Height must be a number.'
            }
        }
    }

    async render() {
        if (!this.flags.width && !this.flags.height) {
            throw new Error('Resize: Either a width or a height must be set.')
        }

        const width = Number(this.flags.width)
        const height = Number(this.flags.height)
        const image = await ImageLoader.fromUrl(this.getUrl())
        const resized = await image.transformFrames(frame => {
            return frame.resize(width, height)
        })

        return resized
    }
}

module.exports = Resize
