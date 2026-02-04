require('dotenv').config()

const path = require('path')
const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const cors = require('cors')
const corsOptions = require('./config/corsOptions')
const DBConnect = require('./config/dbConnect')
const mongoose = require('mongoose')

const PORT = process.env.PORT || 3500

DBConnect()

app.use(express.json())
app.use(cookieParser())
app.use(cors(corsOptions))

app.use('/auth', require('./routes/authRoutes'))
app.use('/users', require('./routes/userRoutes'))
app.use('/words', require('./routes/wordsRoutes'))


mongoose.connection.once('open', () => {
    console.log('Connected to Mongo DB!')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})

mongoose.connection.on('error', (err) => {
    console.log(err)
})