const _Canvas = require('canvas')
const {arrayBufferToBuffer, frameToPngBuffer} = require('./converter.js')
const {createCanvas, Image} = _Canvas

function loadImage(buffer) {
    return new Promise((resolve, reject) => {
        const i = new Image()
        i.onload = () => resolve(i)
        i.onerror = e => reject(e)
        i.src = buffer
    })
}

class Canvas {
    static async fromFrame(frame) {
        const {width, height} = frame
        const canvas = new Canvas(width, height)
        const pngBuffer = await frameToPngBuffer(frame)
        const img = await loadImage(pngBuffer)

        return canvas.getContext(ctx => {
            ctx.clearRect(0, 0, width, height)
            ctx.drawImage(img, 0, 0)
        })
    }

    constructor(width, height) {
        this.width = width
        this.height = height
        this._canvas = createCanvas(width, height)
        this._context = null
    }

    getContext(procedure) {
        let ctx = this._context ? this._context : this._canvas.getContext('2d')

        procedure(ctx)
        this._context = ctx

        return this
    }

    toBuffer() {
        const {data} = this._context.getImageData(0, 0, this.width, this.height)
        return arrayBufferToBuffer(data.buffer)
    }
}

module.exports = Canvas
