module.exports = {
    async resizeForCompositing(frameA, frameB) {
        const {width: widthA, height: heightA} = frameA
        const {width: widthB, height: heightB} = frameB

        if (widthA === widthB && heightA === heightB) {
            return [frameA, frameB]
        }

        if (widthA > widthB || heightA > heightB) {
            let sizes = widthA > heightA ? [widthB] : [null, heightB]
            return [await frameA.resize(...sizes), frameB]
        }

        if (widthB > widthA || heightB > heightA) {
            let sizes = widthB > heightB ? [widthA] : [null, heightA]
            return [frameA, await frameB.resize(...sizes)]
        }
    }
}
