const path = require('path')
const fs = require('fs')

const ASSETS_PATH = path.join(__dirname, '..', 'assets')
const assets = fs.readdirSync(ASSETS_PATH)

class Asset {
    constructor(name) {
        this.name = name
        this.filename = assets.find(a => a.indexOf(name) === 0)
    }

    getPath() {
        return path.join(ASSETS_PATH, this.filename)
    }
}

module.exports = Asset
