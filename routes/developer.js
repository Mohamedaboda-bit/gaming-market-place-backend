import express from "express"
import {
    getAll,
    getProjects,
    getProposals,
    getOneProposal,
    ActiveProjects,
    getOneProjects,
    getDetails
} from "../handlers/developer.js"

const router = express.Router()

router.get('/',getAll)
router.get('/projects',getProjects)
router.get('/projects:id',getOneProjects)
router.get('/ActiveProjects',ActiveProjects)
router.get('/proposals',getProposals)
router.get('/proposals/:id',getOneProposal)
router.get('/details',getDetails)


export default router