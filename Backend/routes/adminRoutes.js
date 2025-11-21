import express from 'express'
import { upload, uploadAccessCodeImages } from "../middlewares/multerConfig.js"
const router = express.Router()
import adminController from '../controllers/admin/adminController.js'
import jobController from '../controllers/admin/jobController.js';
import { createRoute,getRoutes,getRouteById, updateRoute, deleteRoute,toggleRouteStatus, fetchPaginatedRoutes} from "../controllers/admin/routeController.js"
import { changeStatusUser, createUsers, getUsers } from '../controllers/admin/addUserController.js';
import { createAccessCode } from '../controllers/admin/accessCodeControllers.js';
import {DailyExcelUpload, getUpdatedTempDashboardData} from '../controllers/admin/fileUploadsController.js';
import { getAccessCodes,updateAccessCode, } from '../controllers/admin/accessCodeControllers.js';
import { changeRoleAdmin, changeStatusAdmin, createAdmins, getAdmins } from '../controllers/admin/addAdminController.js';
import { getPaymentDashboardData, updatePaymentData,updateWeeklyTempDataToDashboard } from '../controllers/admin/dashboardController.js';
import adminJourneyController from '../controllers/admin/adminJourneyController.js';
import adminAuth from '../middlewares/adminAuth.js';
import { getAllData } from '../controllers/admin/dashController.js';
import { getWeeklyTempData, weeklyExcelUpload } from '../controllers/admin/weeklyUploadsController.js';

router.post('/login',adminController.Login);

// Protect all routes below this line
router.use(adminAuth);

//Job creation
router.post('/addjob', jobController.addJob);
router.put('/updatejob/:id',jobController.updateJob)
router.delete('/deletejob/:id',jobController.deleteJob)
router.patch('/:id/status',jobController.jobStatus)
router.get('/jobs', jobController.fetchPaginatedJobs)

//Route creation
router.post("/routes", createRoute);
router.get("/routes", fetchPaginatedRoutes);
router.get("/routes-list",getRoutes)
router.get("/routes/:id", getRouteById);
router.put("/routes/:id", updateRoute);
router.patch("/routes/:id/status", toggleRouteStatus);
router.delete("/routes/:id", deleteRoute);

//User creation 
router.post('/create-users',createUsers);
router.get('/get-users',getUsers);
router.patch('/toggle-user/:id',changeStatusUser);

//Admin Creation
router.get('/get-cities',jobController.getCities);
router.post("/create-admin",createAdmins);
router.get('/get-admins',getAdmins);
router.patch('/toggle-admin/:id',changeStatusAdmin);
router.patch('/toggle-admin-role/:id',changeRoleAdmin);

//DoubleStop and file upload
router.post('/doubleStop/dailyFileUpload',upload.single('file'),DailyExcelUpload)

//admin journey
router.get("/journeys",adminJourneyController.fetchAllJourneys)
router.post("/journey", adminJourneyController.addJourney);
router.put("/journey/:journey_id",adminJourneyController.updateJourney)
router.get("/drivers",adminJourneyController.fetchAllDrivers)

//payment and dashboard - IMPORTANT: These routes must be in this order
router.get('/dashboard/data', getAllData) // For dropdown data (cities, drivers, routes)
router.get('/dashboard/paymentTable', getPaymentDashboardData) // For table data with filters

//Weekly Upload 
router.post('/doubleStop/weekly-upload',upload.single('file'),weeklyExcelUpload);
router.get('/doubleStop/fetchWeeklyTempData',getWeeklyTempData);
router.post('/doubleStop/update-weekly-excel-to-dashboard',updateWeeklyTempDataToDashboard);

router.get('/doubleStop/tempDashboardData',getUpdatedTempDashboardData);
router.get('/doubleStop/calculatePayment',updatePaymentData);

//logout from Admin
router.post('/logout',adminController.Logout);

//Check for admin User
router.get('/access-admin',adminController.getUser);

router.post("/access-codes", uploadAccessCodeImages.array('images', 3), createAccessCode)
router.get("/access-codes/list", getAccessCodes)
router.put("/access-codes/:id", uploadAccessCodeImages.array('images', 3), updateAccessCode)



export default router;