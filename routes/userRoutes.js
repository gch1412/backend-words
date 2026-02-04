const express = require('express')
const router = express.Router()
const usersControllers = require("../controllers/userControllers")

router.route('/')
    .post(usersControllers.createNewUser)
    .patch(usersControllers.updateUser)
    .delete(usersControllers.deleteUser)

module.exports = router