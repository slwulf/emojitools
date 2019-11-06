const Canvas = require('../util/canvas.js')
const Command = require('./command.js')
const Frame = require('../models/frame.js')
const Asset = require('../models/asset.js')
const ImageUploader = require('../util/image-uploader.js')
const ImageLoader = require('../util/image-loader.js')
const UtilArray = require('../util/array.js')
const {TRANSPARENT_BLACK, PARROT_COLORS, DEFAULT_FRAME_DELAY} = require('../constants.js')

const effectsConfig = {
    '+Intensify': {
        transformation: cmd => cmd.intensify,
        supportsGifs: false
    },
    '+Party': {
        transformation: cmd => cmd.party,
        supportsGifs: false
    },
    '+Spin': {
        transformation: cmd => cmd.spin,
        supportsGifs: false // TODO: set this to true
    },
    '+Cool': {
        transformation: cmd => cmd.cool,
        supportsGifs: true
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

        const effectified = effects.reduce(async (img, effect) => {
            const config = effectsConfig[effect]
            if (img.then) img = await img
            if (image.isAnimated() && config.supportsGifs === false) {
                throw new Error(`Effects: Filter ${effect} does not support animated GIFs.`);
            }
            return img.transformFrames(config.transformation(this))
        }, image)

        return ImageUploader.upload(await effectified)
    }

    intensify(frame, i, frames) {
        const offsets = UtilArray.shuffle([[0, 4], [-4, 6], [2, -6], [-2, 4], [6, -2]])
        const {width, height} = frame

        return frames.length > offsets.length
            ? intensifyFrame(frame, getIntensifyParams(offsets[i % offsets.length], width, height))
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

    spin(frame) {
        const count = UtilArray.ofLength(6)
        return Promise.all(count.map(n => {
            const angle = 360 / count.length
            frame.delay = DEFAULT_FRAME_DELAY / count.length
            return frame.rotate(angle * n)
        }))
    }

    async cool(frame) {
        const asset = new Asset('sunglasses-top')
        const sunglasses = await Frame.fromAsset(asset)
        return frame.overlay(sunglasses)
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
    frame.delay = 0.01

    return frame
        .reframe(x, y, wOffset, hOffset, TRANSPARENT_BLACK)
        .reframe(xOffset, yOffset, width, height)
        .commitTransforms()
}

module.exports = Effects
