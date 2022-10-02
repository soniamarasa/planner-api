import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
    name: String,
    email: String,
    password: String,
    birthdate: Date,
    gender: String,
})

const userModel = mongoose.model('user', userSchema); 

export default userModel;