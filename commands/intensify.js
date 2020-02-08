const Command = require('./command.js')
const Image = require('../models/image.js');
const ImageLoader = require('../util/image-loader.js')
const ImageUploader = require('../util/image-uploader.js')
const UtilArray = require('../util/array.js')
const {TRANSPARENT_BLACK} = require('../constants.js')

class Intensify extends Command {
    static help() {
        return `*Usage:* \`emojitools intensify <url>\``
    }

    async render() {
        const image = await ImageLoader.fromUrl(this.getUrl());
        const frame_delay = 5;

        const frames = image['_frames'];

        let expanded_and_split_frames = UtilArray.flatmap(frames.map((frame, idx) => {
            const expandedFrame = this.expandFrame(frame);
            return this.splitFrame(expandedFrame, frame_delay);
        }));

        let last_offset;
        const intensified_frames = expanded_and_split_frames.map((frame, index) => {
            const [offset_x, offset_y] = this.getOffset(last_offset);
            return this.intensifyFrame(frame, offset_x, offset_y);
        });

        return ImageUploader.upload(new Image(intensified_frames));
    }

    // Temporally split into subframes based on existing delay + new delay. For
    // now we're going to ignore remainders.  TODO: more math?
    splitFrame(frame, new_frame_delay) {
        const new_frame_count = Math.floor(frame['delay'] / new_frame_delay);
        return frame.split(new_frame_count, new_frame_delay);
    }

    // Visually expand the a frame by 6px vertically and 6px horizontally
    expandFrame(frame) {
        const {width, height} = frame;
        return frame
            .reframe(-6, -6, width + 6, height + 6, TRANSPARENT_BLACK)
            .commitTransforms()
    }

    // Return a random offset that is different from the offset passed in
    getOffset(last_offset) {
        const offsets = [[6, 6], [0, 6], [6, 0], [0, 0]];
        let offset_index_options = Array.from(Array(offsets.length).keys());

        if (last_offset !== undefined) {
            const last_offset_index = offsets.findIndex((offset) => {
                return (offset[0] === last_offset[0] && offset[1] === last_offset[1]);
            });
            offset_index_options.splice(last_offset_index, 1);
        }

        return offsets[UtilArray.randomItem(offset_index_options)];
    }

    intensifyFrame(frame, offset_x, offset_y) {
        const {width, height} = frame;
        return frame
            .reframe(offset_x, offset_y, width + 6, height + 6, TRANSPARENT_BLACK)
            .reframe(0, 0, width, height)
            .commitTransforms()
    }
}

module.exports = Intensify
