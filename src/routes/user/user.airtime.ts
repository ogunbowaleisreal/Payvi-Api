import { Router } from "express";

import {
    AirtimeController,
} from "../../controller/users/user.airtime.controler.js";

import {
    ClientAuthMiddleware,
} from "../../middleware/user.auth.middleware.js";


const router = Router();

const airtimeController =
    new AirtimeController();


router.post(
    "/airtime",
    ClientAuthMiddleware,
    airtimeController.purchaseAirtime.bind(
        airtimeController
    )
);


export default router;