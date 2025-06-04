import express from "express"
import {TOP3,getSkills} from "../handlers/home.js"

const router = express.Router()
router.get('/',TOP3)
router.get('/skills',getSkills)


export default router