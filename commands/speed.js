const Command = require('./command.js')
const ImageLoader = require('../util/image-loader.js')
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

        const image = await ImageLoader.fromUrl(this.getUrl())
        const speedAdjusted = await image.transformFrames(frame => {
            frame.delay = usePercent
                ? frame.delay / (speed / 100)
                : speed
            return frame
        })

        return ImageUploader.upload(speedAdjusted)
    }
}

module.exports = Speed
