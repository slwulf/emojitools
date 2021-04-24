const jimp = require('jimp')
const {GifUtil} = require('gifwrap')
const Frame = require('./frame.js')
const {flatmap} = require('../util/array.js')
const {TMP_PATH} = require('../constants.js')

class Image {
    /** INSTANTIATION */

    static fromGif(gif) {
        const frames = gif.frames.map(Frame.fromGifFrame)
        return new Image(frames)
    }

    static fromGifFrame(gifFrame) {
        const frame = Frame.fromGifFrame(gifFrame)
        return new Image([frame])
    }

    static async fromAsset(asset) {
        const gif = await GifUtil.read(asset.getPath())
        return Image.fromGif(gif)
    }

    constructor(frames = []) {
        this.frames = frames
    }

    get frames() {
        return this._frames
    }

    set frames(frames) {
        if (!Array.isArray(frames) || !frames.every(f => f instanceof Frame)) {
            throw new TypeError(`Image.frames must be an array of Frame instances.`)
        }

        this._frames = frames
    }

    get filename() {
        if (!this._filename) {
            const prefix = 'emojitools-'
            const ts = `${Date.now()}`
            const ext = this.getExtension()
            this._filename = `${prefix}${ts}.${ext}`
        }

        return this._filename
    }

    /** CORE */

    writeToFile() {
        const tmpPath = this.getTmpPath()

        if (this.frames.length === 1) {
            return new Promise((resolve, reject) => {
                this.toJimp().write(tmpPath, err => {
                    if (err) return reject(err)
                    resolve(this.filename)
                })
            })
        }

        return GifUtil.write(tmpPath, this.toGifFrames()).then(() => this.filename)
    }

    // transformation should return Frame, Frame[] or a Promise of either
    async transformFrames(transformation) {
        const newFrames = await Promise.all(this.frames.map((frame, i) => {
            return transformation(frame, i, this.frames)
        }))

        return new Image(flatmap(newFrames))
    }

    /** UTILITY */

    getExtension() {
        if (this.isAnimated()) return 'gif'
        return this.toJimp().getExtension()
    }

    getTmpPath() {
        return TMP_PATH + this.filename
    }

    isAnimated() {
        return this.frames.length > 1
    }

    toJimp() {
        if (this.isAnimated()) {
            throw new Error('Animated GIFs cannot be converted to Jimp images.')
        }

        return this.frames[0].toJimp()
    }

    toGifFrames() {
        return this.frames.map(frame => frame.toGifFrame())
    }
}

Image.AUTO = jimp.AUTO

module.exports = Image
