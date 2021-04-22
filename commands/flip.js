const Command = require('./command.js')
const ImageLoader = require('../util/image-loader.js')
const ImageUploader = require('../util/image-uploader.js')

class Flip extends Command {
    static help() {
        return `
*Usage:* \`emojitools flip --orientation=<horizontal|vertical> <url>\`
Orientation defaults to horizontal.
`
    }

    defineFlags() {
        return {
            orientation: {
                test: n => ['horizontal', 'vertical'].includes(n),
                message: 'Orientation can be either horizontal or vertical.',
                default: 'horizontal'
            }
        }
    }

    async render() {
        const {orientation} = this.flags
        const image = await ImageLoader.fromUrl(this.getUrl())
        const flipped = await image.transformFrames(frame => {
            return frame.flip(orientation)
        })

        return flipped
    }
}

module.exports = Flip
