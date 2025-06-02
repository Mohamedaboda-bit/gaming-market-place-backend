import express from "express"
import {getWebsiteData,getClients,getFreelancers,getProject,handleProject,addSkill,addEngine,deleteProject
    ,editProject,getOneProject
} from "../handlers/admin.js"
import {getAllConversations} from "../handlers/message.js"
import {addMod} from "../handlers/user.js"
import { isAuthenticated, authorizeRoles } from "../middleweres/auth.js"

const router = express.Router()

router.get('/',isAuthenticated,authorizeRoles(["admin"]),getWebsiteData)
router.get('/client',isAuthenticated,authorizeRoles(["admin"]),getClients)
router.get('/freelancer',isAuthenticated,authorizeRoles(["admin"]),getFreelancers)
router.get('/projects',isAuthenticated,authorizeRoles(["admin"]),getProject)
router.get('/conversations',isAuthenticated,authorizeRoles(["admin"]),getAllConversations)
router.post('/addMod',isAuthenticated,authorizeRoles(["admin"]),addMod)
router.patch('/project/handle/:id',isAuthenticated,authorizeRoles(["admin"]),handleProject)
router.post('/skill',isAuthenticated,authorizeRoles(["admin"]),addSkill)
router.post('/engines',isAuthenticated,authorizeRoles(["admin"]),addEngine)
router.delete('/projects/:id',isAuthenticated,authorizeRoles(["admin"]),deleteProject)
router.patch('/projects/:id',isAuthenticated,authorizeRoles(["admin"]),editProject)
router.get('/projects/:id',isAuthenticated,authorizeRoles(["admin"]),getOneProject)


export default router