const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const config = require('config');

const users = require('./routes/v0/users');
const posts = require('./routes/v0/posts');
const auth = require('./routes/v0/auth');

const app = express();

// Bodyparser Middleware
app.use(express.json());

// MongoDB config
const db = config.get('mongoURI');

// conncect to mongodb
mongoose.connect(db, { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => console.log('Mongodb connected...'))
    .catch(err => console.log(err));

// use routes
app.use('/v0/users', users);
app.use('/v0/posts', posts);
app.use('/v0/auth', auth);

const port = process.env.PORT || 1337;

app.listen(port, () => console.log(`server started on port ${port}`));