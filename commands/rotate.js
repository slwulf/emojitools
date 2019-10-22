const Command = require('./command.js')
const Image = require('../models/image.js')
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

        const image = await Image.fromUrl(this.getUrl())
        const rotated = await image.transform(
            jimg => jimg.rotate(isClockwise ? degrees : degrees * -1)
        )

        return ImageUploader.upload(rotated)
    }
}

module.exports = Rotate
