const mongoose = require('mongoose');

const User = mongoose.model('User', {
    username:{
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    nama_lengkap: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    resetPasswordLink: {
        data: String,
        default:''
    }
    
});

module.exports = User;