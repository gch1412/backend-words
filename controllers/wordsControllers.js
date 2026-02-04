const path = require('path')
const fsPromises = require('fs').promises

const UserWords = require('../model/UserWords')

const getAllWords = async (req, res) => {
    const category = req.params.category
    const id = req?.id

    const wordsMemory = JSON.parse(await fsPromises.readFile(path.join(__dirname, '..', 'data', 'words', `${category}.json`), "utf8", (err, data) => {
        if (err) throw err

        return data
    }))

    const user = await UserWords.findById(id).lean().exec()

    const wordsMongo = user.words[category]

    const words = [...wordsMemory, ...wordsMongo]

    res.json(words)
}

const getWordById = async (req, res) => {
    const category = req.params.category
    const id = req.params.id

    const words = JSON.parse(await fsPromises.readFile(path.join(__dirname, '..', 'data', 'words', `${category}.json`), "utf8", (err, data) => {
        if (err) throw err

        return data
    }))

    const word = words.find(word => word.id === parseInt(id))

    if (!word) {
        return res.json({ message: `No ${category} with id ${id}` })
    }

    res.json(word)
}

const addNewWord = async (req, res) => {
    const { word, translations, category, wordClass } = req.body
    const userId = req?.id

    if (!userId) {
        return res.status(400).json({ message: "ID is required" })
    }

    const user = await UserWords.findById(userId).exec()

    const wordsMongo = user.words[category]

    let newIdWord

    if (!wordsMongo.length) {
        const wordsMemory = JSON.parse(await fsPromises.readFile(path.join(__dirname, '..', 'data', 'words', `${category}.json`), "utf8", (err, data) => {
            if (err) throw err

            return data
        }))

        newIdWord = wordsMemory[wordsMemory.length - 1].id + 1
    } else {
        newIdWord = wordsMongo[wordsMongo.length - 1].id + 1
    }

    const newWord = { id: newIdWord, word, translations, wordClass, custom: true }

    const newWordsArray = [...wordsMongo, newWord]

    user.words[category] = newWordsArray
    await user.save()

    res.status(201).json({ message: `New word ${word} added` })
}

const updateWord = async (req, res) => {
    const { id, word, translations, wordClass, previousCategory, nextCategory } = req.body
    const userId = req?.id

    if (!id || !previousCategory || !nextCategory) {
        return res.status(400).json({ message: "ID and category are required" })
    }

    if (!userId) {
        return res.status(400).json({ message: "User ID is required" })
    }

    const user = await UserWords.findById(userId).exec()
    const wordsMongo = user.words[previousCategory]

    const selectedWord = wordsMongo.find(word => word.id === parseInt(id))

    if (!selectedWord.custom) {
        return res.status(400).json({ message: "Cannot update this word!" })
    }

    const wordsArray = wordsMongo.filter(word => word.id !== parseInt(id))

    if (previousCategory !== nextCategory) {

        user.words[previousCategory] = wordsArray

        const nextCategoryMemoryArray = JSON.parse(await fsPromises.readFile(path.join(__dirname, '..', 'data', 'words', `${nextCategory}.json`), "utf8", (err, data) => {
            if (err) throw err

            return data
        }))

        const nextCategoryMongoArray = user.words[nextCategory]

        const updatedWord = {
            id: nextCategoryMongoArray.length ? nextCategoryMongoArray[nextCategoryMongoArray.length - 1].id + 1 : nextCategoryMemoryArray[nextCategoryMemoryArray.length - 1].id + 1,
            word,
            translations,
            wordClass: wordClass.toLowerCase(),
        }

        const updatedWordsArray = [...nextCategoryMongoArray, updatedWord].sort((a, b) => a.id - b.id)

        user.words[nextCategory] = updatedWordsArray

        await user.save()

        return res.json(updatedWordsArray)

    } else {

        const updatedWord = {
            id,
            word,
            translations,
            wordClass: wordClass.toLowerCase(),
        }

        const updatedWordsArray = [...wordsArray, updatedWord].sort((a, b) => a.id - b.id)

        user.words[nextCategory] = updatedWordsArray

        await user.save()

        return res.json(updatedWordsArray)
    }
}

const deleteWord = async (req, res) => {
    const { id, category } = req.body
    const userId = req?.id


    if (!id || !category) {
        return res.status(400).json({ message: "ID and category are required" })
    }
    if (!userId) {
        return res.status(400).json({ message: "User ID is required" })
    }

    const user = await UserWords.findById(userId).exec()
    const wordsMongo = user.words[category]

    const selectedWord = wordsMongo.find(word => word.id === parseInt(id))

    if (!selectedWord) {
        return res.status(400).json({ message: "This word does not exist!" })
    }

    if (!selectedWord.custom) {
        return res.status(400).json({ message: "Cannot delete this word!" })
    }

    const wordsArray = wordsMongo.filter(word => word.id !== id)

    user.words[category] = wordsArray

    await user.save()

    res.json(selectedWord)
}

module.exports = {
    getAllWords,
    getWordById,
    addNewWord,
    updateWord,
    deleteWord
}