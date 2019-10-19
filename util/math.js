function randomInt(min, max) {
    return Math.floor(
        (Math.random() * (max - min + 1)) + min
    )
}

function generateRandomOffsets(length, max) {
    return Array.from({length}, () => [
        randomInt(-max, max),
        randomInt(-max, max)
    ])
}

module.exports = {
    randomInt,
    generateRandomOffsets
}
