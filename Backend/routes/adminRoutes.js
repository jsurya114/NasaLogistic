import express from 'express'

const router = express.Router()
import adminController from '../controllers/admin/adminController.js'
import jobController from '../controllers/admin/jobController.js';
import { createRoute,getRoutes,getRouteById, updateRoute, deleteRoute,toggleRouteStatus} from "../controllers/admin/routeController.js"


router.post('/login',adminController.Login);


router.post('/addjob', jobController.addJob);

router.put('/update/:id',jobController.updateJob)
router.delete('/delete/:id',jobController.deleteJob)
router.patch('/:id/status',jobController.jobStatus)
router.get('/jobs', jobController.getJob)


router.post("/routes", createRoute);
router.get("/routes", getRoutes);
router.get("/routes/:id", getRouteById);
router.put("/routes/:id", updateRoute);
router.patch("/routes/:id/status", toggleRouteStatus);
router.delete("/routes/:id", deleteRoute);

export default router