import express from 'express'
import { upload } from '../middlewares/multerConfig.js';
const router = express.Router()
import adminController from '../controllers/admin/adminController.js'
import jobController from '../controllers/admin/jobController.js';
import { createRoute,getRoutes,getRouteById, updateRoute, deleteRoute,toggleRouteStatus, fetchPaginatedRoutes} from "../controllers/admin/routeController.js"
import { changeStatusUser, createUsers, getUsers } from '../controllers/admin/addUserController.js';
import { getRoutes as getAccessCodeRoutes, createAccessCode } from '../controllers/admin/accessCodeControllers.js';
import {DailyExcelUpload, getUpdatedTempDashboardData} from '../controllers/admin/fileUploadsController.js';
import { getAccessCodes,updateAccessCode, } from '../controllers/admin/accessCodeControllers.js';
import { changeRoleAdmin, changeStatusAdmin, createAdmins, getAdmins } from '../controllers/admin/addAdminController.js';

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

//Admin Creation
router.post("/create-admin",createAdmins);
router.get('/get-admins',getAdmins);
router.patch('/toggle-admin/:id',changeStatusAdmin);
router.patch('/toggle-admin-role/:id',changeRoleAdmin);


//DoubleStop and file upload
// for fileuploads use upload.single('file') as middleware
router.post('/doubleStop/dailyFileUpload',upload.single('file'),DailyExcelUpload)


router.post('/ds',DailyExcelUpload)

router.post('/doubleStop/weekly-upload',upload.single('file'),(req,res)=>{
        console.log(req.body,'body in weekly data')

})

router.get('/doubleStop/tempDashboardData',getUpdatedTempDashboardData)


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