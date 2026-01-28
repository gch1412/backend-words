const path = require('path')
const express = require('express')
const app = express()
const cors = require('cors')
const corsOptions = require('./config/corsOptions')

const PORT = process.env.PORT || 3500 

app.use(express.json())
app.use(cors(corsOptions))

app.use('/words', require('./routes/wordsRoutes'))

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))