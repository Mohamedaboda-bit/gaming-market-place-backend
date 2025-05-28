import express from "express"
import {
    getAll,
    getProjects,
    getProposals,
    getOneProposal,
    ActiveProjects,
    getOneProjects,
    getDetails,
    apply
} from "../handlers/developer.js"
import { isAuthenticated, authorizeRoles } from "../middleweres/auth.js"

const router = express.Router()

router.get('/',isAuthenticated,getAll)
router.get('/projects',isAuthenticated,getProjects)
router.get('/projects/:id',isAuthenticated,getOneProjects)
router.get('/ActiveProjects',isAuthenticated,ActiveProjects)
router.get('/proposals',isAuthenticated,getProposals)
router.get('/proposals/:id',isAuthenticated,getOneProposal)
router.get('/details',isAuthenticated,getDetails)
router.post('/proposals',isAuthenticated,authorizeRoles(["freelancer"]),apply)


export default router