const tf = require('@tensorflow/tfjs-node')
const mobilenet = require('@tensorflow-models/mobilenet')
const fs = require('fs')
const jpeg = require('jpeg-js')

const NUMBER_OF_CHANNELS = 3

const readImage = path => {
    const buf = fs.readFileSync(path)
    const pixels = jpeg.decode(buf, true)
    return pixels
}

const imageByteArray = (image, numChannels) => {
    const pixels = image.data
    const numPixels = image.width * image.height;
    const values = new Int32Array(numPixels * numChannels);

    for (let i = 0; i < numPixels; i++) {
      for (let channel = 0; channel < numChannels; ++channel) {
        values[i * numChannels + channel] = pixels[i * 4 + channel]
      }
    }

    return values
}

const imageToInput = (image, numChannels) => {
    const values = imageByteArray(image, numChannels)
    const outShape = [image.height, image.width, numChannels]
    const input = tf.tensor3d(values, outShape, 'int32')

    return input
}

const loadModel = async path => {
    const mn = new mobilenet.MobileNet(1, 1)
    mn.path = `file://${path}`

    try {
      await mn.load()
    }
    catch (error) {
      console.log(error)
    }
    return mn
}

const extractLabels = (predictions, general) => {

    let basic = {}     // all the basic labels go here
    let specific = {}  // specific labels

    predictions.forEach(prediction => {

      const labels = prediction.className.split(',').map(label => label.trim())
      const probability = prediction.probability

      labels.forEach(label => {

          // get the common name from the json
          const commonName = general[label]

          if (commonName && !basic[commonName])
              basic[commonName] = probability
          
          specific[label] = probability
      })

    })

    // merging basic and specific into one
    return Object.assign(basic, specific)
}

const classify = async (path) => {

    let general = require('../util/general').getGeneral()
    const image = readImage(path)
    const input = imageToInput(image, NUMBER_OF_CHANNELS)

    try {
        const mn_model = await loadModel('mobilenet/model.json')
        const predictions = await mn_model.classify(input)

        const result = extractLabels(predictions, general)

        return Promise.resolve(result)
    }
    catch (error) {
        return Promise.reject(error)
    }

}

module.exports = classify
