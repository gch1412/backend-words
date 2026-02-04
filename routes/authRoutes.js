const express = require('express')
const router = express.Router()
const authControllers = require('../controllers/authControllers')

router.route('/login')
    .post(authControllers.login)

router.route('/refresh')
    .get(authControllers.refresh)

router.route('/logout')
    .get(authControllers.logout)

module.exports = router