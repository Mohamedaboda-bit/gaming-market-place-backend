import express from "express"
import {depositToWallet,addPaymentMethod} from "../handlers/payment.js"

const router = express.Router()

router.post('/depositToWallet',depositToWallet)
router.post('/addPaymentMethod',addPaymentMethod)


export default router