import express from "express"
import {getWebsiteData,getClients,getFreelancers,getProject} from "../handlers/admin.js"
import {getAllConversations} from "../handlers/message.js"
import {addMod} from "../handlers/user.js"
import { isAuthenticated, authorizeRoles } from "../middleweres/auth.js"

const router = express.Router()

router.get('/',getWebsiteData)
router.get('/client',getClients)
router.get('/freelancer',getFreelancers)
router.get('/projects',getProject)
router.get('/conversations',getAllConversations)
router.post('/addMod',isAuthenticated,authorizeRoles(["admin"]),addMod)

export default router