import * as express from 'express';
import * as faceapi from 'face-api.js';
import * as low from 'lowdb';
import * as FileSynsc from 'lowdb/adapters/FileSync';
import { canvas } from './env';

const adapter = new FileSynsc('db.json');
const db = low(adapter);
const maxDescriptorDistance = 0.6;

db.defaults({ users: [] }).write();

const router = express.Router();

router.post('/signup', async (req, res) => {
    const captureImage = await canvas.loadImage(req.body.capture);
    const captureDetails = await faceapi.detectSingleFace(captureImage).withFaceLandmarks().withFaceDescriptor();
    
    const labeledDescriptor = new faceapi.LabeledFaceDescriptors('winston', [captureDetails.descriptor]);
    
    db.get('users')
      .push({ 
        name: req.body.name, 
        email: req.body.email,
        capture: labeledDescriptor.toJSON()
    }).write();
    res.send("User has been added")
});

router.post('/login', async (req, res) => {
    var users = db.get('users').value()[0];

    const captureImage = await canvas.loadImage(req.body.capture);
    const captureDetails = await faceapi.detectSingleFace(captureImage).withFaceLandmarks().withFaceDescriptor();

    let labeledDescriptor = faceapi.LabeledFaceDescriptors.fromJSON(users.capture);
    
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptor);

    let bestMatch = faceMatcher.findBestMatch(captureDetails.descriptor);

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