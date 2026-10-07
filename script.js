const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const startBtn = document.getElementById("startBtn");

const statusText = document.getElementById("status");
const objectsText = document.getElementById("objects");

let model;
let detecting = false;


// Start Camera
startBtn.addEventListener("click", async () => {

    try {

        statusText.innerText = "Loading object detection model...";

        // Load COCO-SSD model
        model = await cocoSsd.load();

        statusText.innerText = "Starting camera...";

        // Open webcam
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "user",
                width: 640,
                height: 480
            },
            audio: false
        });

        video.srcObject = stream;

        await video.play();

        startBtn.disabled = true;

        detecting = true;

        statusText.innerText =
            "🟢 Camera ON - Detecting objects";

        detectObjects();

    } catch (error) {

        console.error(error);

        statusText.innerText =
            "❌ Unable to access camera";

        alert(
            "Please allow camera permission and run the project using Live Server."
        );
    }

});


// Object Detection
async function detectObjects() {

    if (!detecting) return;

    const predictions = await model.detect(video);

    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Clear previous boxes
    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    let detectedObjects = [];

    predictions.forEach(prediction => {

        const [
            x,
            y,
            width,
            height
        ] = prediction.bbox;

        const score =
            Math.round(prediction.score * 100);

        // Draw rectangle
        ctx.strokeStyle = "#00ff00";

        ctx.lineWidth = 3;

        ctx.strokeRect(
            x,
            y,
            width,
            height
        );

        // Draw label
        ctx.fillStyle = "#00ff00";

        ctx.font = "18px Arial";

        ctx.fillText(
            prediction.class +
            " " +
            score +
            "%",
            x,
            y > 20 ? y - 5 : y + 20
        );

        detectedObjects.push(
            prediction.class +
            " (" +
            score +
            "%)"
        );

    });


    // Display detected objects
    if (detectedObjects.length > 0) {

        objectsText.innerText =
            detectedObjects.join(", ");

    } else {

        objectsText.innerText =
            "No objects detected";

    }

    // Continue detection
    requestAnimationFrame(detectObjects);
}