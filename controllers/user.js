const classify = require('../classifier/classifier')
const LabelModel = require('../models/label')
const ImageModel = require('../models/image')


exports.getImages = (request, response, next) => {

    console.log('Inside get images')

    ImageModel.find({user: request.user._id})
    .sort({time: 'desc'})
    .select({'filename': 1})
    .exec()
    .then(images => {
        response.render('home', {
            pageTitle: 'Home', 
            images: images, 
            query: ''
        })
    })
    .catch(error => {
        response.render('error', {
            pageTitle: 'Search error', 
            message: 'Oops, something went wrong'})
    })
}

exports.uploadImage = (request, response, next) => {

    console.log(request.file)

    let image

    if (request.file) {

        // save this image to the database
        image = new ImageModel({
            user: request.user._id,
            filename: '/' + request.file.path
        })

        image.save()
        .then(result => {
            response.redirect('/')
            // classify the image
            return classify(request.file.path)
        })
        .then(results => {
            // result is json that contains the classification results
            console.log(results)

            // add the classification results to the images and labels
            image.addClassificationResults(results)

            for (const labelName in results) {
                const probability = results[labelName]

                LabelModel.findOne({$and:[{name: labelName}, {user: request.user._id}]})
                    .then(label => {

                        if (label) {
                            // if label exists, update it
                            label.addImage(request.file.path, probability)
                        }
                        else {
                            // if label does not exist, create a new one for this user
                            new LabelModel({
                                name: labelName.toLowerCase(),
                                user: request.user._id,
                                images: [{
                                    filename: '/' + request.file.path, 
                                    probability: probability
                                }]
                            }).save()
                        }
                    })
                    .catch(error => {
                        console.log('Write error')
                        console.log(error)
                    })
            }

        })
        .catch(error => {
            console.log(error)
            console.log('Upload Error')
        })
    }
    else
        response.redirect('/')
    
}

exports.searchImage = (request, response, next) => {

    const query = request.query['question']

    console.log('Query: ' + query)

    if (!query)
        return response.redirect('/')
    
    // tokenize the input (break it up into words)
    // convert the tokens to lower case as well
    const search = query.split(',').map(label => label.trim().toLowerCase())

    console.log('Search: ' + search)

    const promises = []
    for (let i = 0; i < search.length; i++) {

        // search for individual labels
        const promise = LabelModel.findOne(
            {$and:[{name: search[i]}, {user: request.user._id}]}
        )
        .select({'images': 1})
        .lean()
        .exec()

        promises.push(promise)
    }

    Promise.all(promises)
        .then(labels => {

            let images = []

            for (let i = 0; i < labels.length; i++) {
                const label = labels[i]

                if (label) {
                    // append the images array to the existing one
                    images = images.concat(label.images)
                }
            }

            // send back only the data
            response.status(200).json({message: 'Success!!', images: images})
        })
        .catch(error => {
            console.log(error)
            response.status(500).json({message: 'Search failed'})
        })
    
}

exports.deleteImage = (request, response, next) => {

    const filename = '/images/' + request.params.imageName

    console.log('Delete Name: ' + filename)

    let imageLabels

    // delete from the database as well as the file system
    ImageModel.findOne({$and:[{filename: filename}, {user: request.user._id}]})
        .then(image => {
            // retrieve labels and remove the image
            imageLabels = image.labels

            // remove the image
            return Promise.all([image.remove(), ImageModel.deleteImageFromFS(filename)])
        })
        .then(result => {
            response.status(200).json({message: 'Success!!'})

            // delete the filename from all labels
            for (imageLabel in imageLabels) {

                // search for the label
                LabelModel.findOne({$and:[{name: imageLabel.toLowerCase()}, 
                    {user: request.user._id}]})
                    .then(label => {
                        label.deleteImage(filename)
                    })
                    .catch(error => {
                        console.log(error)
                    })
            }
        })
        .catch(error => {
            console.log(error)
            response.status(500).json({message: 'Delete failed'})
        })

}
