const {exec} = require('child_process')
const {IMGSHARE_SSH} = require('../constants.js')

module.exports = {
    async upload(image) {
        const filename = await image.writeToFile()
        return new Promise((resolve, reject) => {
            exec(`scp ${image.getTmpPath(filename)} ${IMGSHARE_SSH}`, err => {
                if (err) return reject(err)
                resolve(image.getImgshareUrl(filename))
            })
        })
    },
}
