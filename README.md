# `emojitools`
_the cool slack emoji manipulation interface for cool kids_

### Usage

First, install the package into your project.

```
npm install @slwulf/emojitools
```

Then, import the package and execute a command.

```js
const Emojitools = require('@slwulf/emojitools')
const cli = 'effects +Intensify http://path.to/my/image'

Emojitools.fromCommandLineInput(cli)
    .then(emoji => emoji.message ? console.log(emoji.message) : emoji.writeToFile())
    .then(filepath => filepath && console.log(filepath))
```

Emojitools is intended to be used as a command line or chat bot interface, so the static method `EmojiTools.fromCommandLineInput`, which receives raw user input, is the best way to use it.

The package exposes an `emoji` interface as its execution result that allows you to access or further modify a command's output. Read below for more details on working with the image output.

The command line interface has built-in help text for each command. Entering `emojitools --help` will expose a list of commands, and `emojitools <command> --help` describes each command and its inputs.

### API Documentation

#### Emojitools

- **`Emojitools.fromCommandLineInput(cli[, opts])`**
    - `cli` _\(string\)_ the command line input
    - `opts` _\(object\)_ render and behavior options
        - `plaintext` _\(boolean\)_ determines whether `emoji.message` is in plaintext or markdown. defaults to false, for markdown.
    - Returns a Promise that resolves to an [`Emoji`](models/emoji.js) instance.

#### Emoji

- **`emoji.message (?string)`**
    - a property that will be set if an emoji was not rendered, usually because help text was requested instead.
- **`emoji.saveToFile([filepath])`**
    - `filepath` _\(string\)_ optional, absolute path the file should be saved at
    - Returns a Promise that resolves to the saved filepath of the rendered emoji
- **`emoji.saveToReadStream()`**
    - Returns a Promise that resolves to a `stream.Readable` instance of the rendered emoji
