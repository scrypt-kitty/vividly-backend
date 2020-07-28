const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const users = require('./routes/api/users');
const posts = require('./routes/api/posts');

const app = express();

// Bodyparser Middleware
app.use(express.json());

// MongoDB config
const db = require('./config/keys').mongoURI;

// conncect to mongodb
mongoose.connect(db, {useUnifiedTopology: true, useNewUrlParser: true})
    .then(() => console.log('Mongodb connected...'))
    .catch(err => console.log(err));

// use routes
app.use('/api/users', users);
app.use('/api/posts', posts);

const port = process.env.PORT || 1337;

app.listen(port, () => console.log(`server started on port ${port}`));