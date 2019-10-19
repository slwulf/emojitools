const Command = require('./command.js')
const Image = require('../util/image.js')
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
        const image = await Image.fromUrl(this.getUrl())
        const flipped = await image.transform(jimg => {
            return jimg.flip(
                orientation === 'horizontal',
                orientation === 'vertical'
            )
        })

        return ImageUploader.upload(flipped)
    }
}

module.exports = Flip
