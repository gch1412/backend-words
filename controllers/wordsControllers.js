const path = require('path')
const fsPromises = require('fs').promises

const getAllWords = async (req, res) => {
    const category = req.params.category
    
    const words = JSON.parse(await fsPromises.readFile(path.join(__dirname, '..', 'data', 'words', `${category}.json`), "utf8", (err, data) => {
        if (err) throw err

        return data
    }))

    res.header('Access-Control-Allow-Origin', 'https://gch1412.github.io/')

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

    const words = JSON.parse(await fsPromises.readFile(path.join(__dirname, '..', 'data', 'words', `${category}.json`), "utf8", (err, data) => {
        if (err) throw err

        return data
    }))

    const newId = words.length ? words[words.length - 1].id + 1 : 1

    const newWord = { id: newId, word, translations, wordClass, custom: true }

    const newWordsArray = [...words, newWord]

    await fsPromises.writeFile(path.join(__dirname, '..', 'data', 'words', `${category}.json`), JSON.stringify(newWordsArray))

    res.status(201).json({ message: `New word ${word} added` })
}

const updateWord = async (req, res) => {
    const { id, word, translations, wordClass, previousCategory, nextCategory, custom } = req.body

    if (!id || !previousCategory || !nextCategory) {
        return res.status(400).json({ message: "ID and category are required" })
    }

    const words = JSON.parse(await fsPromises.readFile(path.join(__dirname, '..', 'data', 'words', `${previousCategory}.json`), "utf8", (err, data) => {
        if (err) throw err

        return data
    }))

    const selectedWord = words.find(word => word.id === parseInt(id))

    if (!selectedWord.custom) {
        return res.status(400).json({ message: "Cannot update this word!" })
    }

    const wordsArray = words.filter(word => word.id !== parseInt(id))

    if (previousCategory !== nextCategory) {

        await fsPromises.writeFile(path.join(__dirname, '..', 'data', 'words', `${previousCategory}.json`), JSON.stringify(wordsArray))

        const nextCategoryArray = JSON.parse(await fsPromises.readFile(path.join(__dirname, '..', 'data', 'words', `${nextCategory}.json`), 'utf8', (err, data) => {
            if (err) throw err

            return data
        }))

        const updatedWord = {
            id: nextCategoryArray.length ? nextCategoryArray[nextCategoryArray.length - 1].id + 1 : 1,
            word,
            translations,
            wordClass: wordClass.toLowerCase(),
            custom
        }

        const updatedWordsArray = [...nextCategoryArray, updatedWord].sort((a, b) => a.id - b.id)

        await fsPromises.writeFile(path.join(__dirname, '..', 'data', 'words', `${nextCategory}.json`), JSON.stringify(updatedWordsArray))

        return res.json(updatedWordsArray)

    } else {

        const updatedWord = {
            id,
            word,
            translations,
            wordClass: wordClass.toLowerCase(),
            custom
        }

        const updatedWordsArray = [...wordsArray, updatedWord].sort((a, b) => a.id - b.id)

        await fsPromises.writeFile(path.join(__dirname, '..', 'data', 'words', `${nextCategory}.json`), JSON.stringify(updatedWordsArray))

        return res.json(updatedWordsArray)
    }
}

const deleteWord = async (req, res) => {
    const { id, category } = req.body

    const words = JSON.parse(await fsPromises.readFile(path.join(__dirname, '..', 'data', 'words', `${category}.json`), "utf8", (err, data) => {
        if (err) throw err

        return data
    }))

    const selectedWord = words.find(word => word.id === parseInt(id))

    if (!selectedWord.custom) {
        return res.status(400).json({ message: "Cannot delete this word!" })
    }

    const wordsArray = words.filter(word => word.id !== id)

    await fsPromises.writeFile(path.join(__dirname, '..', 'data', 'words', `${category}.json`), JSON.stringify(wordsArray))

    res.json(selectedWord)
}

module.exports = {
    getAllWords,
    getWordById,
    addNewWord,
    updateWord,
    deleteWord
}