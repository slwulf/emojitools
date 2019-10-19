const Canvas = require('../util/canvas.js')
const Command = require('./command.js')
const Image = require('../util/image.js')
const ImageUploader = require('../util/image-uploader.js')
const Converter = require('../util/converter.js')
const {TRANSPARENT_BLACK, PARROT_COLORS} = require('../constants.js')

const effectsConfig = {
    '+Intensify': {
        transformation: cmd => cmd.intensify,
        minFrameCount: 6,
        useGifwrap: true
    },
    '+Party': {
        transformation: cmd => cmd.party,
        minFrameCount: PARROT_COLORS.length,
        useGifwrap: true
    }
}

class Effects extends Command {
    static help() {
        return `
*Usage:* \`emojitools effects <effect> [effect [effect [...]]] <url>\`
_Known effects:_ ${Object.keys(effectsConfig).join(', ')}
`
    }

    getEffects() {
        const effects = Object.keys(effectsConfig)
        return this.inputs.filter(i => effects.includes(i))
    }

    async render() {
        const effects = this.getEffects()
        const image = await Image.fromUrl(this.getUrl())

        const effectified = await effects.reduce(async (img, effect) => {
            if (img.then) img = await img

            const config = effectsConfig[effect]
            const frameCount = img.framesCount > config.minFrameCount
                ? img.framesCount
                : config.minFrameCount

            if (config.useGifwrap) {
                await img.transformFrames(config.transformation(this), frameCount)
            } else {
                await img.transform(config.transformation(this))
            }

            return img
        }, image)

        return ImageUploader.upload(effectified)
    }

    intensify(frame, i) {
        // generated using util/math#generateRandomOffsets
        const offsets = [[6, 14], [-12, 5], [-9, 12], [6, -15], [-18, -19]]
        const [x, y] = offsets[i % offsets.length]
        const {width, height} = frame.bitmap
        const xOffset = x < 0 ? Math.abs(x) : 0
        const yOffset = y < 0 ? Math.abs(y) : 0
        const wOffset = width + Math.abs(x)
        const hOffset = height + Math.abs(y)

        frame.reframe(x, y, wOffset, hOffset, TRANSPARENT_BLACK)
        frame.reframe(xOffset, yOffset, width, height)

        return frame
    }

    async party(frame, i) {
        const jimg = Converter.toJimp(frame)
        const png = await Converter.jimpToPngBuffer(jimg)
        const {width, height} = jimg.bitmap
        const canvas = await Canvas.fromBitmap({width, height, data: png})
        const buffer = canvas.getContext(ctx => {
            ctx.globalCompositeOperation = 'source-atop'
            ctx.fillStyle = PARROT_COLORS[i % PARROT_COLORS.length]
            ctx.globalAlpha = 0.5
            ctx.fillRect(0, 0, width, height)
        }).toBuffer()

        const bitmap = Converter.bufferToBitmap({width, height, data: buffer})
        return Converter.bitmapToGifFrame(bitmap)
    }
}

module.exports = Effects
