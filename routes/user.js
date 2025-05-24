import express from "express"
import {register,login,gelInfos} from "../handlers/user.js"

const router = express.Router()

router.post("/register",register)
router.post("/login",login)
router.get("/:id",gelInfos)

export default router
