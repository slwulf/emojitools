const Canvas = require('../util/canvas.js')
const Command = require('./command.js')
const Image = require('../models/image.js')
const Frame = require('../models/frame.js')
const Asset = require('../models/asset.js')
const ImageUploader = require('../util/image-uploader.js')
const ImageLoader = require('../util/image-loader.js')
const UtilArray = require('../util/array.js')
const {TRANSPARENT_BLACK, PARROT_COLORS} = require('../constants.js')

const effectsConfig = {
    '+Intensify': {
        transformation: cmd => cmd.intensify,
        supportsGifs: true
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
        transformation: cmd => cmd.overlayAsset('sunglasses-top'),
        supportsGifs: true
    },
    '+Thinking': {
        transformation: cmd => cmd.overlayAsset('thinking-hand'),
        supportsGifs: true
    },
    '+Cowboy': {
        transformation: cmd => cmd.overlayAsset('cowboy-hat'),
        supportsGifs: true
    },
    '+No': {
        transformation: cmd => cmd.overlayAsset('no'),
        supportsGifs: true
    },
    '+Crying': {
        transformation: cmd => cmd.overlayAnimatedAsset('tears'),
        supportsGifs: false
    },
    '+Fire': {
        transformation: cmd => cmd.overlayAnimatedAsset('fire'),
        supportsGifs: false
    },
    '+DealWithIt': {
        transformation: cmd => cmd.overlayAnimatedAsset('deal-with-it'),
        supportsGifs: false
    }
}

class Effects extends Command {
    static help() {
        return `
*Usage:* \`emojitools effects <effect> [effect [effect [...]]] <url>\`
_Known effects:_ ${Object.keys(effectsConfig).sort().join(', ')}
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

    intensify(frame) {
        const offsets = UtilArray.shuffle([[0, 4], [-4, 6], [2, -6], [-2, 4], [6, -2], [-6, 3]])
        const {width, height} = frame

        // Make a bigger frame so we can move things around
        let biggerFrame = frame
            .reframe(-6, -6, width + 6, height + 6, TRANSPARENT_BLACK)
            .commitTransforms()

        return offsets.map(offset => intensifyFrame(biggerFrame, offset))
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
        const {width, height} = frame
        const isSquare = width === height
        let resized = null

        if (!isSquare) {
            let edgeLength = Math.max(width, height)
            let xOffset = (width - edgeLength) / 2
            let yOffset = (height - edgeLength) / 2
            resized = frame
                .reframe(xOffset, yOffset, edgeLength, edgeLength, TRANSPARENT_BLACK)
                .commitTransforms()
        }

        return Promise.all(count.map(n => {
            const angle = 360 / count.length

            // false here tells Jimp not to resize the frame on rotation
            return (resized || frame).rotate(-1 * angle * n, false)
        }))
    }

    overlayAsset(assetName) {
        return async frame => {
            const asset = new Asset(assetName)
            const overlay = await Frame.fromAsset(asset)
            return frame.overlay(overlay)
        }
    }

    overlayAnimatedAsset(assetName) {
        return async frame => {
            const asset = new Asset(assetName)
            const overlay = await Image.fromAsset(asset)
            return Promise.all(overlay.frames.map(fr => {
                return frame.overlay(fr, fr.delay)
            }))
        }
    }
}

function intensifyFrame(frame, [x, y]) {
    const {width, height} = frame
    frame.delay = 0.01

    return frame
        .reframe(x, y, width + 6, height + 6, TRANSPARENT_BLACK)
        .reframe(0, 0, width, height)
        .commitTransforms()
}

module.exports = Effects
