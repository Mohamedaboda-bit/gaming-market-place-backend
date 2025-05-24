import express from "express"
import {getLastTen} from "../handlers/notification.js"

const router = express.Router()

router.get('/:id',getLastTen)


export default router