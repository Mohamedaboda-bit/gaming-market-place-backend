import express from "express"
import {getLastTen,isRead} from "../handlers/notification.js"
import { isAuthenticated } from "../middleweres/auth.js"

const router = express.Router()

router.get('/',isAuthenticated,getLastTen)
router.patch('/:id',isAuthenticated,isRead)


export default router