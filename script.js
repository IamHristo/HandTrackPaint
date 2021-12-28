const video = document.getElementById("myvideo");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const canvasForPainting = document.getElementById("canvasForPainting");
const contextForPainting = canvasForPainting.getContext("2d");
let trackButton = document.getElementById("trackbutton");
let updateNote = document.getElementById("updatenote");

let isVideo = false;
let model = null;

const modelParams = {
    flipHorizontal: true, // flip e.g for video  
    maxNumBoxes: 20, // maximum number of boxes to detect
    iouThreshold: 0.5, // ioU threshold for non-max suppression
    scoreThreshold: 0.6, // confidence threshold for predictions.
}

function startVideo() {
    handTrack.startVideo(video).then(function(status) {
        console.log("video started", status);
        if (status) {
            updateNote.innerText = "Video started. Now tracking"
            isVideo = true
            runDetection()
        } else {
            updateNote.innerText = "Please enable video"
        }
    });
}

function toggleVideo() {
    if (!isVideo) {
        updateNote.innerText = "Starting video"
        startVideo();
    } else {
        updateNote.innerText = "Stopping video"
        handTrack.stopVideo(video)
        isVideo = false;
        updateNote.innerText = "Video stopped"
    }
}

function runDetection() {
    model.detect(video).then(predictions => {
        //console.log("Predictions: ", predictions);
        if (predictions.length != 0) {
            predictions.forEach(element => {
                // Check if object class is closed(2) or pointed(4) hand
                if (element.class == '4') {
                    //console.log(element.bbox[0]); // X
                    //console.log(element.bbox[1]); // Y
                    //console.log(element.bbox[2]); // Width
                    //console.log(element.bbox[3]); // Height
                    draw(calcPointX(element.bbox[0], element.bbox[2]), calcPointY(element.bbox[1], element.bbox[3]), calcRadius(element.bbox[2], element.bbox[3]));
                }
            });
        }
        model.renderPredictions(predictions, canvas, context, video);
        if (isVideo) {
            requestAnimationFrame(runDetection);
        }
    });
}

function calcRadius(width, height) {
    let radius = ((((width + height) / 1000) * 1.5) * 10);
    //console.log(radius);
    return radius;
}

function calcPointX(posX, width) {
    let pointX = posX + (width / 2);
    //console.log('Point X - ' + pointX);
    return pointX;
}

function calcPointY(posY, height) {
    let pointY = posY + (height / 2);
    //console.log('Point Y - ' + pointY);
    return pointY;
}

function draw(posY, posX, radius) {
    //console.log('X - ' + posX + 'Y - ' + posY);
    //console.log('R - ' + radius);
    contextForPainting.fillStyle = 'red';
    contextForPainting.beginPath();
    contextForPainting.arc(posY / 3, posX / 3, radius, 0, 2 * Math.PI);
    contextForPainting.closePath();
    contextForPainting.fill();
}

// Load the model.
handTrack.load(modelParams).then(lmodel => {
    // detect objects in the image.
    model = lmodel
    updateNote.innerText = "Loaded Model!"
    trackButton.disabled = false

    canvasForPainting.addEventListener('click', (e) => {

        let radius = Math.floor(Math.random() * 51 + 50);
        let color = 'rgb(' +
            Math.floor(Math.random() * (255 - 50 + 1) + 50) + ', ' +
            Math.floor(Math.random() * (255 - 50 + 1) + 50) + ', ' +
            Math.floor(Math.random() * (255 - 50 + 1) + 50) + ')';

        console.log(e);
        contextForPainting.fillStyle = color;
        contextForPainting.beginPath();
        contextForPainting.arc(150, 150, 10, 0, 2 * Math.PI);
        contextForPainting.closePath();
        contextForPainting.fill();
    })

});