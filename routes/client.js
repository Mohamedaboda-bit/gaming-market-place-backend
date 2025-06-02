import express from "express"
import {getAll,getAllProjects,getPayments,createProject,handleProposal,getProposals,
    deleteProject,editProject,getOneProject
} from "../handlers/client.js"
import { isAuthenticated } from "../middleweres/auth.js"

const router = express.Router()

router.get('/',isAuthenticated,getAll)
router.get('/projects',isAuthenticated,getAllProjects)
router.get('/payments',isAuthenticated,getPayments)
router.post('/projects',isAuthenticated,createProject)
router.patch('/proposals',isAuthenticated,handleProposal)
router.get('/proposals/:id',isAuthenticated,getProposals)
router.delete('/projects/:id',isAuthenticated,deleteProject)
router.patch('/projects/:id',isAuthenticated,editProject)
router.get('/projects/:id',isAuthenticated,getOneProject)


export default router