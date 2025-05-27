import express from "express"
import {getAll,getAllProjects,getPayments,createProject} from "../handlers/client.js"
import { isAuthenticated } from "../middleweres/auth.js"

const router = express.Router()

router.get('/',isAuthenticated,getAll)
router.get('/projects',isAuthenticated,getAllProjects)
router.get('/payments',isAuthenticated,getPayments)
router.post('/projects',isAuthenticated,createProject)


export default router