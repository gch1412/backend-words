const UserWords = require('../model/UserWords')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const login = async (req, res) => {
    const { username, password } = req.body

    if (!username, !password) {
        return res.status(400).json({
            message: 'All fields are required'
        })
    }

    const foundUser = await UserWords.findOne({ username }).exec()

    if (!foundUser || !foundUser.active) {
        return res.status(401).json({
            message: "Username not found"
        })
    }

    const match = await bcrypt.compare(password, foundUser.password)

    if (!match) return res.status(401).json({
        message: "Incorrect password"
    })

    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "id": foundUser._id,
                "username": foundUser.username
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { "expiresIn": "15s" }
    )

    const refreshToken = jwt.sign(
        { "username": foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1d" }
    )

    foundUser.refreshToken = refreshToken
    await foundUser.save()

    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    if (req?.headers?.from == '/users') {
        return accessToken
    }

    res.json({ accessToken })
}

const refresh = async (req, res) => {
    const cookies = req.cookies

    if (!cookies?.jwt) return res.status(401).json({ message: 'No JWT cookies' })

    const refreshToken = cookies.jwt

    const foundUser = await UserWords.findOne({ refreshToken }).exec()

    if (!foundUser) return res.status(401).json({ message: 'User not found' })

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {

            if (err || foundUser.username !== decoded.username) {
                return res.status(403).json({ message: 'Refresh token expired' })
            }

            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "id": foundUser._id,
                        "username": foundUser.username
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { "expiresIn": '15s' }
            )
            
            res.json({ accessToken })
        }
    )
}

const logout = async (req, res) => {
    const cookies = req.cookies

    if (!cookies?.jwt) return res.sendStatus(204)

    const refreshToken = cookies.jwt

    const foundUser = await UserWords.findOne({ refreshToken }).exec()

    if (!foundUser) {
        res.clearCookie('jwt', { httpOnly: true, maxAge: 24 * 60 * 60 * 1000, secure: true })
        return res.sendStatus(401)
    }

    foundUser.refreshToken = ""
    await foundUser.save()

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })

    res.json({ message: 'Cookie cleared' })
}

module.exports = {
    login,
    refresh,
    logout
}