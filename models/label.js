const mongoose = require('mongoose')

const Schema = mongoose.Schema

const labelSchema = new Schema({

    name: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    images: [{
        filename: {
            type: String,
            required: true
        },
        probability: {
            type: Number,
            required: true
        }
    }]
})

labelSchema.methods.addImage = function(path, probability) {
    this.images.push({filename: '/' + path, probability: probability})
    this.save()
}

// delete image with the given path
labelSchema.methods.deleteImage = function (path) {

    this.images = this.images.filter(image => image.filename !== path)

    // if no images remain, get rid of the entire document
    if (this.images.length === 0)
        this.remove()
    else
        this.save()
}

module.exports = mongoose.model('Label', labelSchema)
