import express from 'express'

const router = express.Router()
import adminController from '../controllers/admin/adminController.js'
router.get('/login',adminController.Login)
router.post('/login',adminController.Login)

// router.post('/dashboard')

// router.post('/routes')
// router.post('/jobs')
// router.post('/drivers')


export default router