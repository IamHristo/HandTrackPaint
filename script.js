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

function showProps(obj) {
    let result = '';
    for (let i in obj) {
        if (obj.hasOwnProperty(i)) {
            result += `${obj}.${i} = ${obj[i]}\n`;
        }
    }
    console.log(result);
}


function runDetection() {
    model.detect(video).then(predictions => {
        //console.log("Predictions: ", predictions);
        if (predictions.length != 0) {
            predictions.forEach(element => {
                // Check if object class is closed(2) or pointed(4) hand
                if (element.class == '4') {
                    //console.log(element.bbox[0]); // Y
                    //console.log(element.bbox[1]); // X
                }
            });
        }
        //draw(predictions[0], predictions[1]);
        model.renderPredictions(predictions, canvas, context, video);
        if (isVideo) {
            requestAnimationFrame(runDetection);
        }
    });
}

function draw(posX, posY) {
    // mouse left button must be pressed
    if (e.buttons !== 1) return;

    contextForPainting.beginPath(); // begin

    contextForPainting.lineWidth = posX * 0.1;
    contextForPainting.lineCap = 'round';
    contextForPainting.strokeStyle = '#c0392b';

    contextForPainting.moveTo(posX, posY); // from
    //setPosition(e);
    contextForPainting.lineTo(posX, posY); // to

    contextForPainting.stroke(); // draw it!
}

// Load the model.
handTrack.load(modelParams).then(lmodel => {
    // detect objects in the image.
    model = lmodel
    updateNote.innerText = "Loaded Model!"
    trackButton.disabled = false
});