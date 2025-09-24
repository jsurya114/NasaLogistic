import express from "express"

import driverController from "../controllers/driver/driverController.js";

const router = express.Router()

router.post('/login',driverController.Login)


export default router;