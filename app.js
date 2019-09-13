const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv')
const app = express();

dotenv.config();

mongoose.connect(process.env.DB_CONNECT, {useNewUrlParser: true})
.then(()=> console.log('db connected...'))
.catch((err)=> console.log(err))

app.use(express.json());
app.use(express.urlencoded({extended: false}))

const routes = require('./routes/api')

app.use('/api/user', routes);


app.listen(4000, ()=> {
    console.log('server is running')
})