import express from 'express'
import { upload } from '../middlewares/multerConfig.js';
const router = express.Router()
import adminController from '../controllers/admin/adminController.js'
import jobController from '../controllers/admin/jobController.js';
import { createRoute,getRoutes,getRouteById, updateRoute, deleteRoute,toggleRouteStatus} from "../controllers/admin/routeController.js"
import { changeStatusUser, createUsers, getUsers } from '../controllers/admin/addUserController.js';
import { getRoutes as getAccessCodeRoutes, createAccessCode } from '../controllers/admin/accessCodeControllers.js';
import {DailyExcelUpload} from '../controllers/admin/fileUploadsController.js';


router.post('/login',adminController.Login);
router.get('/jobs', jobController.getJob);

//Job creation
router.post('/addjob', jobController.addJob);
router.put('/updatejob/:id',jobController.updateJob)
router.delete('/deletejob/:id',jobController.deleteJob)
router.patch('/:id/status',jobController.jobStatus)
router.get('/jobs', jobController.getJob)

//Route creation
router.post("/routes", createRoute);
router.get("/routes", getRoutes);
router.get("/routes/:id", getRouteById);
router.put("/routes/:id", updateRoute);
router.patch("/routes/:id/status", toggleRouteStatus);
router.delete("/routes/:id", deleteRoute);

//User creation 
router.post('/create-users',createUsers);
router.get('/get-users',getUsers);
router.patch('/toggle-user/:id',changeStatusUser);


//doubleStop and file upload
// for fileuploads use upload.single('file') as middleware
router.post('/doubleStop/fileUpload',upload.single('file'),DailyExcelUpload)
router.post('/ds',DailyExcelUpload)


// router.get('/admin/check-for-user',checkforSuperAdminOrNot)

//logout from Admin
router.post('/logout',adminController.Logout);

//Check for admin User
router.get('/access-admin',adminController.getUser);

router.get("/access-codes",getAccessCodeRoutes)
router.post("/access-codes",createAccessCode)
router.get("/access-codes/list", getAccessCodes)
router.put("/access-codes/:id", updateAccessCode)

export default router;