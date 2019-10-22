const Canvas = require('../util/canvas.js')
const Command = require('./command.js')
const Frame = require('../models/frame.js')
const ImageUploader = require('../util/image-uploader.js')
const ImageLoader = require('../util/image-loader.js')
const {generateRandomOffsets} = require('../util/math.js')
const {TRANSPARENT_BLACK, PARROT_COLORS} = require('../constants.js')

const effectsConfig = {
    '+Intensify': {
        transformation: cmd => cmd.intensify,
        minFrameCount: 6
    },
    '+Party': {
        transformation: cmd => cmd.party,
        minFrameCount: PARROT_COLORS.length
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
        const image = await ImageLoader.fromUrl(this.getUrl())

        const effectified = effects.reduce((img, effect) => {
            const config = effectsConfig[effect]
            return img.transformFrames(config.transformation(this))
        }, image)

        return ImageUploader.upload(await effectified)
    }

    intensify(frame, i, frames) {
        // generated using util/math#generateRandomOffsets
        // const offsets = [[6, 14], [-12, 5], [-9, 12], [6, -15], [-18, -19]]
        const minFrames = 6
        const offsetCount = frames.length > minFrames ? 1 : minFrames
        const {width, height} = frame
        const offsets = generateRandomOffsets(offsetCount, width / 7)

        return offsetCount === 1
            ? intensifyFrame(frame, getIntensifyParams(offsets[0], width, height))
            : offsets.map(offset => {
                return intensifyFrame(frame, getIntensifyParams(offset, width, height))
            })
    }

    async party(frame) {
        const {width, height} = frame

        return await Promise.all(PARROT_COLORS.map(async color => {
            const canvas = await Canvas.fromFrame(frame)
            const buffer = canvas.getContext(ctx => {
                ctx.globalCompositeOperation = 'source-atop'
                ctx.fillStyle = color
                ctx.globalAlpha = 0.5
                ctx.fillRect(0, 0, width, height)
            }).toBuffer()

            return new Frame(width, height, buffer, frame.delay)
        }))
    }
}

function getIntensifyParams([x, y], width, height) {
    const xOffset = x < 0 ? Math.abs(x) : 0
    const yOffset = y < 0 ? Math.abs(y) : 0
    const wOffset = width + Math.abs(x)
    const hOffset = height + Math.abs(y)

    return {x, y, xOffset, yOffset, wOffset, hOffset}
}

function intensifyFrame(frame, params) {
    const {x, y, xOffset, yOffset, wOffset, hOffset} = params
    const {width, height} = frame
    return frame
        .reframe(x, y, wOffset, hOffset, TRANSPARENT_BLACK)
        .reframe(xOffset, yOffset, width, height)
        .commitTransforms()
}

module.exports = Effects
