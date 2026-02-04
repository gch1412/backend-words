const mongoose = require('mongoose')

const wordSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    word: {
        type: String,
        required: true
    },
    translations: {
        type: [String],
        required: true
    },
    wordClass: {
        type: String,
        required: true,
        enum: [
            "preposition",
            "noun",
            "verb",
            "adjective",
            "adverb",
            "pronoun",
            "conjunction",
            "interjection"
        ]
    },
    custom: {
        type: Boolean,
        default: true
    }

},
    { _id: false }
)

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    words: {
        type: {
            "nouns": [wordSchema],
            "adjectives": [wordSchema],
            "verbs": [wordSchema],
            "grammatical": [wordSchema]
        },
        default: {
            "nouns": [],
            "adjectives": [],
            "verbs": [],
            "grammatical": []
        }
    },
    active: {
        type: Boolean,
        default: true
    },
    refreshToken: {
        type: String,
        default: ""
    }
})

module.exports = mongoose.model('User', userSchema)