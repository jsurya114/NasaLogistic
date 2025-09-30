import express from "express"

import driverController from "../controllers/driver/driverController.js";
import { saveJourney,fetchTodayJourney } from "../controllers/driver/journeyController.js";
import { getAccessCodes,updateAccessCode, } from '../controllers/admin/accessCodeControllers.js';
import { getRoutes as getAccessCodeRoutes, createAccessCode } from '../controllers/admin/accessCodeControllers.js';
import { getRoutes } from "../controllers/admin/routeController.js";

const router = express.Router()

router.post('/login',driverController.Login)
router.get("/access-driver",driverController.getDriver)
router.post("/logout",driverController.Logout)
router.post("/journey",saveJourney)

router.get("/journey/:driver_id",fetchTodayJourney)
router.get("/routes-list",getRoutes)
//AccessCode Management 
router.get("/access-codes",getAccessCodeRoutes)
router.post("/access-codes",createAccessCode)
router.get("/access-codes/list", getAccessCodes)
router.put("/access-codes/:id", updateAccessCode)

export default router;