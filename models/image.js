const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')
const appDir = path.dirname(require.main.filename)

const Schema = mongoose.Schema

const imageSchema = new Schema({

    user: {
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    labels: {
        type: Object
    },
    time : { 
        type : Date, 
        default: Date.now 
    }
})

// save classification results to the image
imageSchema.methods.addClassificationResults = function(results) {
    this.labels = results
    this.save()
}

// delete image from the file system whose path is given
imageSchema.statics.deleteImageFromFS = function(path) {

    return new Promise((resolve, reject) => {

        fs.unlink(appDir + path, (error) => {
            if (error)
                reject(error)
            else {
                console.log('File ' + path + ' deleted successfully...')
                resolve()
            }
        })
    })

}

module.exports = mongoose.model('Image', imageSchema)
