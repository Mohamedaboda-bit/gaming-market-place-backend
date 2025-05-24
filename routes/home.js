import express from "express"
import {TOP3} from "../handlers/home.js"

const router = express.Router()
router.get('/',TOP3)


export default router