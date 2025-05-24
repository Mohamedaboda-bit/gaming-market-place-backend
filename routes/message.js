import express from "express"
import {getCanvos} from "../handlers/message.js"

const router = express.Router()
router.get('/',getCanvos)
router.get('/:id',getCanvos)


export default router