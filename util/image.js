const jimp = require('jimp')
const {GifUtil, GifFrame, GifCodec, BitmapImage} = require('gifwrap')
const ImageLoader = require('./image-loader.js')
const {toJimp, toGifwrap} = require('./converter.js')
const {TMP_PATH, IMGSHARE_URL} = require('../constants.js')

class Image {
    /** INSTANTIATION */

    static async fromUrl(url) {
        const image = await ImageLoader.fromUrl(url)
        return new Image(image)
    }

    constructor(image) {
        this.image = image
        this.frameDelay = image.frames
            ? image.frames.map(({delayCentisecs}) => delayCentisecs)
            : [] // if there are no frames, delay doesn't matter
    }

    get framesCount() {
        return this.image.frames ? this.image.frames.length : 1
    }

    /** UTILITY */

    writeToFile(namespace) {
        const prefix = namespace ? namespace + '-' : ''
        const ts = `${Date.now()}`
        const ext = this.getExtension()
        const filename = `${prefix}${ts}.${ext}`

        if (!this.image.frames) {
            return new Promise((resolve, reject) => {
                toJimp(this.image).write(this.getTmpPath(filename), err => {
                    if (err) return reject(err)
                    resolve(filename)
                })
            })
        }

        return GifUtil.write(this.getTmpPath(filename), this.image.frames)
            .then(() => filename)
    }

    getExtension() {
        if (this.image.frames) return 'gif'

        let jimg = this.getJimp()
        return Array.isArray(jimg)
            ? jimg[0].getExtension()
            : jimg.getExtension()
    }

    getTmpPath(filename) {
        return TMP_PATH + filename
    }

    getImgshareUrl(filename) {
        return IMGSHARE_URL + filename
    }

    getJimp() {
        return this.image.frames
            ? this.image.frames.map(toJimp)
            : toJimp(this.image)
    }

    getFrameDelay(frame) {
        return this.frameDelay[frame]
    }

    setImage(image) {
        this.image = image
    }

    isAnimated() {
        return this.image.frames && this.image.frames.length > 1
    }

    /** TRANSFORMS */

    // transformation should return a Promise of a Jimp image
    async transform(transformation) {
        let jimg = this.getJimp()

        if (Array.isArray(jimg)) {
            await Promise.all(jimg.map(transformation))

            this.setImage(await (new GifCodec).encodeGif(
                jimg.map((frame, i) => toGifwrap(frame, this.getFrameDelay(i)))
            ))

            return this
        }

        await transformation(jimg)
        this.setImage(toGifwrap(jimg))
        return this
    }

    // transformation should return a Promise of a GifFrame
    async transformFrames(transformation, frameCount) {
        const frames = this.isAnimated()
            ? Array.from(
                { length: frameCount || this.framesCount },
                (_, i) => this.image.frames[i % this.framesCount]
            )
            : Array.from(
                { length: frameCount },
                () => toGifwrap(this.getJimp())
            )

        const newFrames = await Promise.all(frames.map(frame => {
            // original impl
            return transformation(frame)

            // new impl
            // const frame = new Frame.fromGifFrame(sourceFrame) // chg fn arg name
            // const newFrame = transformation(frame)
            // if (Array.isArray(newFrame)) {
            //     // need to change Promise.all(frames.map to flatmap
            //     return newFrame.map(fr => fr.delay = frame.delay / newFrame.length)
            // }
            // return newFrame

            // // in transformation(frame)
            // const frames = frame.split(4).map(myCoolTransformation)
        }))
        this.setImage(await (new GifCodec).encodeGif(newFrames))
        return this
    }
}

Image.AUTO = jimp.AUTO

module.exports = Image
