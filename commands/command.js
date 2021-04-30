class Command {
    constructor(inputs = [], flags = {}) {
        this.inputs = inputs
        this.flags = this.validateFlags(flags)
    }

    get name() {
        return this.constructor.name
    }

    send(output) {
        console.log(output)
    }

    async render() {
        return ''
    }

    static help(plaintext) {
        return `${this.name} has no help text.`
    }

    getUrl() {
        return this.inputs.find(opt => opt.indexOf('http') === 0)
    }

    defineFlags() {
        return {}
    }

    validateFlags(flags) {
        const definitions = this.defineFlags()

        Object.keys(definitions).forEach(flag => {
            const value = flags[flag]
            const definition = definitions[flag]

            if (value === undefined) {
                if (definition.required) {
                    throw new Error(`${this.name}: Flag ${flag} is required.`)
                } else {
                    flags[flag] = definition.default
                }
            } else if (!definition.test(value)) {
                throw new Error(`${this.name}: ${definition.message || `Invalid input for flag ${flag}`}`)
            }
        })

        return flags
    }
}

module.exports = Command
