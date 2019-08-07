const deleteImage = (button) => {

    const imageName = button.parentNode.querySelector('[name=imageName]')
    .value
    .split('/images/')[1]

    const csrf = button.parentNode.querySelector('[name=_csrf]').value

    const imageElement = button.closest('article')

    fetch('/image/' + imageName, {
        method: 'DELETE',
        headers: {
            'csrf-token': csrf
        }
    })
    .then(result => {
        return result.json()
    })
    .then(data => {
        console.log(data)
        // remove the image from the page
        imageElement.remove()
    })
    .catch(error => {
        console.log(error)
    })
}

const searchImages = (button) => {

    const query = button.parentNode.querySelector('[name=question]').value

    console.log(query)

    const uri = '/search?question=' + query

    fetch(uri, {
        method: 'GET'
    })
    .then(result => {
        return result.json()
    })
    .then(data => {

        console.log(data)

        const articles = document.getElementById("divImages").getElementsByTagName("article")

        // insert all the images retrieved into a set
        let set = new Set()

        for (let j = 0; j < data.images.length; j++) {
            const imageName = data.images[j.toString()].filename
            set.add(imageName)
        }
        
        for (let i = 0; i < articles.length; i++) {

            // get the 'src' value of the image from the html element
            const image = articles[i].firstChild.firstChild.firstChild.src
                          .split('http://localhost:8000')[1]
            
            // only show the image names that we retreived from the server
            let style
            if (set.has(image))
                style = "block"
            else
                style = "none"

            articles[i].style.display = style
        }

    })
    .catch(error => {
        console.log(error)
    })
}

const displayImage = (button) => {

    // show the image full screen
    const imageName = button.parentNode.querySelector('[name=imageName]')
    .value

    window.location.href = imageName
}

const showOptions = (image) => {

    // show the options for viewing and deleting the image clicked
    const parentDiv = image.parentNode.parentNode.childNodes[1]

    const viewImage = parentDiv.childNodes[0]
    const deleteImage = parentDiv.childNodes[1]

    // toggle the view and delete options on clicking
    if (viewImage.style.visibility === "visible") {
        viewImage.style.visibility = "hidden"
        deleteImage.style.visibility = "hidden"
    }
    else {
        viewImage.style.visibility = "visible"
        deleteImage.style.visibility = "visible"
    }

}
