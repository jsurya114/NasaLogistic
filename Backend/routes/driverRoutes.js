import express from "express"
import { uploadAccessCodeImages } from "../middlewares/multerConfig.js";

import driverController from "../controllers/driver/driverController.js";
import { saveJourney,fetchTodayJourney } from "../controllers/driver/journeyController.js";
import { getAccessCodes,createAccessCode } from '../controllers/driver/accessCodeControllers.js';
import { getRoutes } from "../controllers/admin/routeController.js";
import getDeliverySummary from "../controllers/driver/deliveryController.js";
import driverAuth from '../middlewares/driverAuth.js';
const router = express.Router()

router.post('/login', driverController.Login)

// Protect all routes below this line
router.use(driverAuth)

router.get("/access-driver", driverController.getDriver)
router.post("/logout", driverController.Logout)
router.post("/journey", saveJourney)
router.get("/journey/:driver_id", fetchTodayJourney)
router.get("/routes-list", getRoutes)
router.get("/deliveries/:driverId", getDeliverySummary)
// AccessCode Management 
router.post("/access-codes", uploadAccessCodeImages.array('images', 3), createAccessCode)
router.get("/access-codes/list", getAccessCodes)

export default router;