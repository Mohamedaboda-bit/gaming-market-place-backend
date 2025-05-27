import express from "express"
import {getCanvos,getACanvo} from "../handlers/message.js"
import { isAuthenticated, authorizeRoles } from "../middleweres/auth.js"

const router = express.Router()
router.get('/',isAuthenticated,getCanvos)
router.get('/:id',isAuthenticated,getACanvo)


export default router