import '@tensorflow/tfjs-node';
import * as faceapi from 'face-api.js';
import { canvas } from './env';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { router } from './routes';

const app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


app.use('/', router);

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