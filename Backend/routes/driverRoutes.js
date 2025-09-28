import express from "express"

import driverController from "../controllers/driver/driverController.js";
import { saveJourney,fetchTodayJourney } from "../controllers/driver/journeyController.js";

const router = express.Router()

router.post('/login',driverController.Login)
router.get("/access-driver",driverController.getDriver)
router.post("/logout",driverController.Logout)
router.post("/journey",saveJourney)
router.get("/journey/:driver_id",fetchTodayJourney)

export default router;