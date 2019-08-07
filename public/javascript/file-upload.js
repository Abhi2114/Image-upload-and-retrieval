const inputElement = document.getElementById("image");

inputElement.addEventListener("change", handleFiles, false);

function handleFiles() {

    // the picker allows us to choose only one file
    const file = this.files
    
    const fileName = file['0'].name
    const fileType = file['0'].type

    console.log(file['0'])
    console.log(fileName)
    console.log(fileType)

    document.getElementById("upload_button").style.display= "none"
    document.getElementById("button_div").style.display= "block"
    document.getElementById('label_image').innerHTML = fileName

}
