import express from "express"
import {getCanvos,getACanvo,sendMessage,startConversation } from "../handlers/message.js"
import { isAuthenticated,authorizeRoles } from "../middleweres/auth.js"

const router = express.Router()
router.get('/',isAuthenticated,getCanvos)
router.get('/:id',isAuthenticated,getACanvo)
router.post('/',isAuthenticated,sendMessage)
router.post('/startConversation',isAuthenticated,authorizeRoles(["client"]),startConversation)


export default router