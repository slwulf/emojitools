module.exports = {
    flatmap(arr, f = n => n) {
        return arr.reduce((a, x, i) => {
            return a.concat(f(x, i, arr))
        }, [])
    },
    shuffle(arr) {
        let i, j
        for (i = arr.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1))
            [arr[i], arr[j]] = [arr[j], arr[i]]
        }
        return arr
    },
    ofLength(length) {
        return Array.from({length}, (_, i) => i)
    },
    randomItem(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }
}
