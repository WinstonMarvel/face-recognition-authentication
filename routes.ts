import * as express from 'express';
import * as faceapi from 'face-api.js';
import * as low from 'lowdb';
import * as FileSynsc from 'lowdb/adapters/FileSync';
import { canvas } from './env';

const adapter = new FileSynsc('db.json');
const db = low(adapter);

const REFERENCE_IMG = './images/ref.jpg';
const QUERY_IMG = './images/query.jpg';

db.defaults({ users: [] }).write();

const router = express.Router();

router.post('/signup', async (req, res) => {
    const captureImage = await canvas.loadImage(req.body.capture);
    const captureDetails = await faceapi.detectSingleFace(captureImage).withFaceLandmarks().withFaceDescriptor();
    console.log(req.body)
    db
    .get('users')
    .push({ 
        name: req.body.name, 
        email: req.body.email,
        capture: captureDetails
    })
    .write();
    res.send("User has been added")
});

router.post('/login', (req, res) => {
    res.send("HELLOW FROM ROUTE")
});

router.get('/test', async (req, res) => {
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


export { router }