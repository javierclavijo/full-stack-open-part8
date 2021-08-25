const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        minlength: 4
    },
    born: {
        type: Number,
    },
})

schema.virtual('bookCount', {
    ref: 'Book',
    localField: '_id',
    foreignField: 'author',
    count: true,
})

schema.pre('find', function () {
    this.populate('bookCount')
})
schema.pre('findOne', function () {
    this.populate('bookCount')
})


module.exports = mongoose.model('Author', schema)