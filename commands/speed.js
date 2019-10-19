const Command = require('./command.js')
const Image = require('../util/image.js')
const ImageUploader = require('../util/image-uploader.js')

class Speed extends Command {
    static help() {
        return `
*Usage:* \`emojitools speed n[%] <url>\`
_n_ is in hundredths/second. Pass in \`n%\` to adjust speed by % of original.
`
    }

    getSpeed() {
        return this.inputs.find(i => i.indexOf('http') === -1)
    }

    async render() {
        const amount = this.getSpeed()
        const usePercent = amount.indexOf('%') > -1
        const speed = Number(amount.replace('%', ''))
        if (isNaN(speed)) {
            throw new Error(`Speed: Invalid speed value ${this.getSpeed()}`)
        }

        const image = await Image.fromUrl(this.getUrl())
        const speedAdjusted = await image.transformFrames(frame => {
            frame.delayCentisecs = usePercent
                ? frame.delayCentisecs / (speed / 100)
                : speed
            return frame
        })

        return ImageUploader.upload(speedAdjusted)
    }
}

module.exports = Speed
