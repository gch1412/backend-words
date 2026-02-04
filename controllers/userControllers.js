const UserWords = require('../model/UserWords')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { login } = require('./authControllers')

const createNewUser = async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).json({
            message: 'All fields are required'
        })
    }

    const duplicate = await UserWords.findOne({ username }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate username' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const userWordsObject = { username, "password": hashedPassword }

    const user = await UserWords.create(userWordsObject)

    if (user) {
        req.headers.from = '/users'
        const accessToken = await login(req, res)
        
        //Erro está aqui
        return res.status(201).json({ message: `New user ${username} created.`, accessToken})
    } else {
        return res.status(400).json({ message: "Invalid user data received" })
    }
}

const updateUser = async (req, res) => {

}

const deleteUser = async (req, res) => {

}

module.exports = {
    createNewUser,
    updateUser,
    deleteUser
}