module.exports = {
    flatmap(arr, f = n => n) {
        return arr.reduce((a, x, i) => {
            return a.concat(f(x, i, arr))
        }, [])
    }
}
