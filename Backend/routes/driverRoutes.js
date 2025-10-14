import express from "express"

import driverController from "../controllers/driver/driverController.js";
import { saveJourney,fetchTodayJourney } from "../controllers/driver/journeyController.js";
import { getAccessCodes,createAccessCode } from '../controllers/driver/accessCodeControllers.js';
import { getRoutes } from "../controllers/admin/routeController.js";
import getDeliverySummary from "../controllers/driver/deliveryController.js";
const router = express.Router()

router.post('/login',driverController.Login)
router.get("/access-driver",driverController.getDriver)
router.post("/logout",driverController.Logout)
router.post("/journey",saveJourney)

router.get("/journey/:driver_id",fetchTodayJourney)
router.get("/routes-list",getRoutes)
router.get("/deliveries/:driverId",getDeliverySummary)
//AccessCode Management 

router.post("/access-codes",createAccessCode)
router.get("/access-codes/list", getAccessCodes)

export default router;