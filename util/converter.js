const jimp = require('jimp')
const {GifUtil, GifFrame, BitmapImage} = require('gifwrap')
const {DEFAULT_FRAME_DELAY} = require('../constants.js')

module.exports = {
    arrayBufferToBuffer(ab) {
        let buffer = Buffer.alloc(ab.byteLength);
        let view = new Uint8Array(ab);
        for (let i = 0; i < buffer.length; ++i) {
            buffer[i] = view[i];
        }
        return buffer;
    },
    bufferToBitmap(buffer) {
        return new BitmapImage(buffer)
    },
    bitmapToGifFrame(bitmap, delayCentisecs = DEFAULT_FRAME_DELAY) {
        return new GifFrame(bitmap, {delayCentisecs})
    },
    jimpToPngBuffer(jimg) {
        return jimg.getBufferAsync(jimp.MIME_PNG)
    },
    toJimp(gif) {
        return GifUtil.copyAsJimp(jimp, gif)
    },
    toJimpRef(gif) {
        return GifUtil.shareAsJimp(jimp, gif)
    },
    toGifwrap(jimg, delayCentisecs = DEFAULT_FRAME_DELAY) {
        let bitmap = new BitmapImage(jimg.bitmap)
        let frame = new GifFrame(bitmap, {delayCentisecs})
        GifUtil.quantizeWu(frame)
        return frame
    }
}
