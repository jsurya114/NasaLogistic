import express from 'express'

const router = express.Router()
import adminController from '../controllers/admin/adminController.js'
import jobController from '../controllers/admin/jobController.js';
import { createRoute,getRoutes,getRouteById, updateRoute, deleteRoute,toggleRouteStatus, fetchPaginatedRoutes} from "../controllers/admin/routeController.js"
import { changeStatusUser, createUsers, getUsers } from '../controllers/admin/addUserController.js';


router.post('/login',adminController.Login);


//Job creation
router.post('/addjob', jobController.addJob);
router.put('/updatejob/:id',jobController.updateJob)
router.delete('/deletejob/:id',jobController.deleteJob)
router.patch('/:id/status',jobController.jobStatus)
router.get('/jobs', jobController.fetchPaginatedJobs)

//Route creation
router.post("/routes", createRoute);
router.get("/routes", fetchPaginatedRoutes);
router.get("/routes/:id", getRouteById);
router.put("/routes/:id", updateRoute);
router.patch("/routes/:id/status", toggleRouteStatus);
router.delete("/routes/:id", deleteRoute);

//User creation 
router.post('/create-users',createUsers);
router.get('/get-users',getUsers);
router.patch('/toggle-user/:id',changeStatusUser);

// router.get('/admin/check-for-user',checkforSuperAdminOrNot)

//logout from Admin
router.post('/logout',adminController.Logout);

//Check for admin User
router.get('/access-admin',adminController.getUser);


export default router;