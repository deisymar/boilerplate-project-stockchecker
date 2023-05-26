'use strict';

const mongoose = require('mongoose');

module.exports = class DB {
    connect() {
        return mongoose.connect(process.env.DB, {useNewUrlParser: true,
    useUnifiedTopology: true,}).catch(error => console.log(error.message));
    }
    
}