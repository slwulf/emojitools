const _Canvas = require('canvas')
const {arrayBufferToBuffer} = require('./converter.js')
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
    static async fromBitmap(bitmap) {
        const canvas = new Canvas(bitmap.width, bitmap.height)
        const img = await loadImage(bitmap.data)

        return canvas.getContext(ctx => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
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
