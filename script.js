const video = document.getElementById("myvideo");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const canvasForPainting = document.getElementById("canvasForPainting");
const contextForPainting = canvasForPainting.getContext("2d");
const colorPicker = document.getElementById("colorPicker");
const customOrangeColor = 'rgb(245,147,20)';
const blackColor = 'rgb(0,0,0)';
const blackColorTransperent = 'rgb(0,0,0,100)';
let trackButton = document.getElementById("trackbutton");
let updateNote = document.getElementById("updatenote");
let color;
let isVideo = false;
let isDrawOnVideo = false;
let model = null;

const modelParams = {
    flipHorizontal: true, // flip e.g for video  
    maxNumBoxes: 20, // maximum number of boxes to detect
    iouThreshold: 0.5, // ioU threshold for non-max suppression
    scoreThreshold: 0.6, // confidence threshold for predictions.
}

function startVideo() {
    handTrack.startVideo(video).then(function(status) {
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
        updateNote.innerText = "Starting video";
        updateNote.style.background = customOrangeColor;
        startVideo();
    } else {
        updateNote.innerText = "Stopping video"
        updateNote.style.background = blackColor;
        handTrack.stopVideo(video)
        isVideo = false;
        updateNote.innerText = "Video stopped"
    }
}

function runDetection() {
    model.detect(video).then(predictions => {
        if (predictions.length != 0) {
            predictions.forEach(element => {
                if (element.class == '4') {
                    draw(calcPointX(element.bbox[0], element.bbox[2]), calcPointY(element.bbox[1], element.bbox[3]), calcRadius(element.bbox[2], element.bbox[3]), color);
                } else if (element.class == '1' && !isDrawOnVideo) {
                    erase(calcPointX(element.bbox[0], element.bbox[2]), calcPointY(element.bbox[1], element.bbox[3]), calcRadius(element.bbox[2], element.bbox[3]));
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
    return radius;
}

function calcPointX(posX, width) {
    let pointX = posX + (width / 2);
    return pointX;
}

function calcPointY(posY, height) {
    let pointY = posY + (height / 2);
    return pointY;
}

function draw(posY, posX, radius, color) {
    contextForPainting.fillStyle = color;
    contextForPainting.beginPath();
    contextForPainting.arc(posY / 3, posX / 3, radius, 0, 2 * Math.PI);
    contextForPainting.closePath();
    contextForPainting.fill();
}

function erase(posY, posX, radius) {
    draw(posY, posX, radius, blackColor);
}

function drawOverVideo() {
    let button = document.getElementById('drawOnVideoButton');
    if (!isDrawOnVideo) {
        button.style.background = customOrangeColor;
        canvasForPainting.classList.add("canvasOverVideo");
        canvasForPainting.style.background = 'transparent';
        canvasForPainting.style.opacity = 1;
        isDrawOnVideo = true;
    } else {
        button.style.background = blackColor;
        canvasForPainting.classList.remove("canvasOverVideo");
        canvasForPainting.style.background = blackColor;
        isDrawOnVideo = false;
    }
}

// Load the model.
handTrack.load(modelParams).then(lmodel => {
    // detect objects in the image.
    model = lmodel;
    updateNote.innerText = "Loaded Model!";
    trackButton.disabled = false;

    color = colorPicker.value;
    colorPicker.addEventListener('change', function() {
        color = this.value;
    });
});