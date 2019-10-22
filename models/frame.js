const {GifUtil, GifFrame} = require('gifwrap')
const Converter = require('../util/converter.js')
const {DEFAULT_FRAME_DELAY} = require('../constants.js')

class Frame {
    static fromGifFrame(gifFrame) {
        const {bitmap, delayCentisecs} = gifFrame
        const {width, height, data} = bitmap
        return new Frame(width, height, data, delayCentisecs)
    }

    static fromJimp(jimg) {
        const gifFrame = Converter.jimpToGifFrame(jimg)
        return Frame.fromGifFrame(gifFrame)
    }

    constructor(width, height, buffer, delay = DEFAULT_FRAME_DELAY) {
        this.width = width
        this.height = height
        this.buffer = buffer
        this.delay = delay

        this.transformQueue = []
    }

    get hasChanges() {
        return this.transformQueue.length > 0
    }

    get gifFrame() {
        if (!this._gifFrame) {
            this._gifFrame = this.toGifFrame()
        }

        return this._gifFrame
    }

    clone() {
        const {width, height, buffer, delay} = this
        return new Frame(width, height, buffer, delay)
    }

    split(n) {
        return Array.from({length: n}, () => this.clone())
    }

    /** TRANSFORMS */

    queueTransform(transform) {
        this.transformQueue.push(transform)
    }

    commitTransforms() {
        this.transformQueue.forEach(transform => {
            transform(this.gifFrame)
        })

        this.transformQueue = []

        return Frame.fromGifFrame(this.gifFrame)
    }

    reframe(xOffset, yOffset, width, height, fillRGBA) {
        this.queueTransform(gifFrame => {
            gifFrame.reframe(xOffset, yOffset, width, height, fillRGBA)
        })

        return this
    }

    /** UTILITY */

    toGifFrame() {
        const {width, height} = this
        const gifFrame = new GifFrame(
            {width, height, data: this.buffer},
            {delayCentisecs: this.delay}
        )

        GifUtil.quantizeWu(gifFrame)
        return gifFrame
    }

    toJimp() {
        return Converter.gifFrameToJimp(this.toGifFrame())
    }
}

module.exports = Frame
