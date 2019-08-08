const mongoose = require('mongoose');

const {
    Schema
} = mongoose;

const UserSchema = new Schema({
    interest: Array,
    time: String,
});


mongoose.model('Users', UserSchema);