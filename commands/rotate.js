const Command = require('./command.js')
const ImageLoader = require('../util/image-loader.js')
const ImageUploader = require('../util/image-uploader.js')

class Rotate extends Command {
    static help() {
        return `
*Usage:* \`emojitools rotate <degrees> --direction=<clockwise|counterclockwise> <url>\`
Direction defaults to clockwise.
`
    }

    defineFlags() {
        return {
            direction: {
                test: n => ['clockwise', 'counterclockwise'].includes(n),
                message: 'Direction can be either clockwise or counterclockwise.',
                default: 'clockwise'
            }
        }
    }

    getDegrees() {
        return Math.abs(this.inputs.find(i => !isNaN(i)))
    }

    async render() {
        const degrees = this.getDegrees()
        const isClockwise = this.flags.direction === 'clockwise'

        if (isNaN(degrees) || degrees < 0) {
            throw new Error('Rotate: Must provide a positive integer for how many degrees to rotate.')
        }

        const image = await ImageLoader.fromUrl(this.getUrl())
        const rotated = await image.transformFrames(
            frame => frame.rotate(isClockwise ? degrees : degrees * -1)
        )

        return ImageUploader.upload(rotated)
    }
}

module.exports = Rotate
