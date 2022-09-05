import mongoose from 'mongoose';

const itemSchema = mongoose.Schema({
    idUser: String,
    description: String,
    type: String,
    where: String,
    obs: String,
    started: Boolean,
    finished: Boolean,
    important: Boolean,
    canceled: Boolean,
})

const itemModel = mongoose.model('item', itemSchema); 

export default itemModel;