const express = require('express')
const router = express.Router()
const wordsControllers = require('../controllers/wordsControllers')

router.route('/')
    .post(wordsControllers.addNewWord)
    .patch(wordsControllers.updateWord)
    .delete(wordsControllers.deleteWord)

router.route('/:category')
    .get(wordsControllers.getAllWords)

router.route('/:category/:id')
    .get(wordsControllers.getWordById)

module.exports = router