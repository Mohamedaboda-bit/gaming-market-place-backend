import express from "express"
import {getWebsiteData,getClients,getFreelancers,getProject} from "../handlers/admin.js"
import {getAllConversations} from "../handlers/message.js"
import {register} from "../handlers/user.js"

const router = express.Router()

router.get('/',getWebsiteData)
router.get('/client',getClients)
router.get('/freelancer',getFreelancers)
router.get('/projects',getProject)
router.get('/conversations',getAllConversations)
router.get('/addMod',register)

export default router