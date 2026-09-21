import { Router } from "express";

import { TransactionPinController } from "../../controller/users/transaction.pin.controller.js";

import { ClientAuthMiddleware } from "../../middleware/user.auth.middleware.js";

import {
    setTransactionPinSchema,
    changeTransactionPinSchema,
} from "../../validators/wallet.validator.js";

import { validate } from "../../middleware/validator.middleware.js";

const router = Router();

const transactionPinController =
    new TransactionPinController();

router.post(
    "/set",
    ClientAuthMiddleware,
    validate(setTransactionPinSchema),
    transactionPinController.setPin.bind(
        transactionPinController
    )
);

router.patch(
    "/change",
    ClientAuthMiddleware,
    validate(changeTransactionPinSchema),
    transactionPinController.changePin.bind(
        transactionPinController
    )
);

export default router;