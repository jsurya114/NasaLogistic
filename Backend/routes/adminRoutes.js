import express from 'express'

const router = express.Router()
import adminController from '../controllers/admin/adminController.js'
import jobController from '../controllers/admin/jobController.js';


router.post('/login',adminController.Login);


router.post('/addjob', jobController.addJob);

router.put('/update/:id',jobController.updateJob)
router.delete('/delete/:id',jobController.deleteJob)
router.patch('/:id/status',jobController.jobStatus)


export default router