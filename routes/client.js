import express from "express"
import {getAll,getAllProjects,getPayments} from "../handlers/client.js"

const router = express.Router()

router.get('/',getAll)
router.get('/projects',getAllProjects)
router.get('/payments',getPayments)


export default router