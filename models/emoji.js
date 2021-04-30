const fs = require('fs')

// this is a user-facing wrapper around the Image class
module.exports = function Emoji(message, image) {
    return {
        /**
         * Saves the resulting image to disk
         * @param path (String) optional filepath to save at
         * @return (Promise) resolves to the saved filepath
         */
        saveToDisk(path) {
            return image.writeToFile(path)
        },
        /**
         * Saves the resulting image to a Buffer
         * @return (Promise) resolves to a Buffer of the image
         */
        saveToBuffer() {
            return image.writeToFile()
                .then(path => fs.readFile(path))
        },
        /**
         * Saves the resulting image to a read stream
         * @return (Promise) resolves to a read stream of the image
         */
        saveToReadStream() {
            return image.writeToFile()
                .then(path => fs.createReadStream(path))
        },

        /**
         * @property message (?String) a contextual message, usually command help text
         */
        message
    }
}
