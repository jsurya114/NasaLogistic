import express from "express"

import driverController from "../controllers/driver/driverController.js";

const router = express.Router()

router.post('/login',driverController.Login)
router.get("/access-driver",driverController.getDriver)
router.post("/logout",driverController.Logout)

export default router;