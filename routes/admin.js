import express from "express"
import {getWebsiteData,getClients,getFreelancers,getProject,handleProject,addSkill} from "../handlers/admin.js"
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
router.post('/project',isAuthenticated,authorizeRoles(["admin"]),handleProject)
router.post('/skill',isAuthenticated,authorizeRoles(["admin"]),addSkill)

export default router