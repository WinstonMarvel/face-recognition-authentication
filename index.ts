const canvas = require('canvas');
import * as express from 'express';
import * as faceapi from 'face-api.js';

const { Canvas, Image, ImageData } = canvas;

faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const app = express();

const REFERENCE_IMG = './images/ref.jpg';
const QUERY_IMG = './images/query.jpg';



app.get('/', async (req, res) => {
    const referenceImage = await canvas.loadImage(REFERENCE_IMG)
    const queryImage = await canvas.loadImage(QUERY_IMG)

      const resultsRef = await faceapi.detectSingleFace(referenceImage)
    .withFaceLandmarks()
    .withFaceDescriptor()

    const resultsQuery = await faceapi.detectSingleFace(queryImage)
        .withFaceLandmarks()
        .withFaceDescriptor()

    const maxDescriptorDistance = 0.6
    const faceMatcher = new faceapi.FaceMatcher(resultsRef)
    const bestMatch = faceMatcher.findBestMatch(resultsQuery.descriptor)
 
    if(bestMatch.distance > maxDescriptorDistance){
        res.status(400).json({
            sucess: false,
            result: `Did Not Match: ${bestMatch.distance}`
        })
    }
    else{
        res.status(200).json({
            sucess: true,
            result: `Found Match: ${bestMatch.distance}`
        })
    }
});




(async function(){
    const MODEL_URL = './assets/weights';
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL)
    await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL)
    await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL)
})()
.then(() =>{
    app.listen(8080, () => console.log("Listening"));
})
.catch( (e) => { 
    console.log("Error: " +e)
});