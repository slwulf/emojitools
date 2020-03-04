const Command = require('./command.js')
const Image = require('../models/image.js')
const ImageLoader = require('../util/image-loader.js')
const ImageUploader = require('../util/image-uploader.js')
const {resizeAllForCompositing} = require('../util/frame.js')

class Append extends Command {
    static help() {
        return `
*Usage:* \`emojitools append [--delay=<n>] <url> <url> [<url> [<url> [...]]]\`
You must pass in at least two URLs, but you can pass in as many as you like.
Optionally pass in a \`--delay\` in ms (default is 60.)
`
    }

    defineFlags() {
        return {
            delay: {
                test: n => !isNaN(n),
                message: 'Delay must be a number.',
                default: 60
            }
        }
    }

    getUrls() {
        return this.inputs.filter(i => i.indexOf('http') === 0)
    }

    async render() {
        const urls = this.getUrls()

        if (urls.length < 2) {
            throw new Error('Append: At least two images are required.')
        }

        const frames = await Promise.all(urls.map(async url => {
            const image = await ImageLoader.fromUrl(url)
            const frame = image.frames[0]
            if (image.isAnimated()) {
                throw new Error('Append: Animated GIFs are not supported.')
            }
            return frame
        }))

        const resized = (await resizeAllForCompositing(frames)).map(frame => {
            frame.delay = this.flags.delay
            return frame
        })

        return ImageUploader.upload(new Image(resized))
    }
}

module.exports = Append
