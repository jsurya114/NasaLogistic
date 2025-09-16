import express from 'express'

const router = express.Router()
import adminController from '../controllers/admin/adminController.js'
import jobController from '../controllers/admin/jobController.js';


router.post('/login',adminController.Login);
router.get('/jobs', jobController.getJob);


router.post('/addjob', jobController.addJob);

router.put('/updatejob/:id',jobController.updateJob)
router.delete('/deletejob/:id',jobController.deleteJob)
router.patch('/:id/status',jobController.jobStatus)


export default router