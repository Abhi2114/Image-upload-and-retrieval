const fs = require('fs')
const path = require('path')

const appDir = path.dirname(require.main.filename)

let general

exports.readGeneral = () => {
    // read the general file and store it in general

    fs.readFile(appDir + '/data/general.json', 'utf8', function (err, data) {
        if (err) throw err
    
        general = JSON.parse(data)
    })
}

exports.getGeneral = () => {
    if (general)
        return general
    
    throw 'General not found'
}
