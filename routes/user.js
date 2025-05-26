import express from "express"
import { register, login, gelInfos } from "../handlers/user.js"
import { isAuthenticated, authorizeRoles } from "../middleweres/auth.js"

const router = express.Router()

router.post("/register", register)
router.post("/login", login)
router.get("/:id", isAuthenticated, authorizeRoles(["admin", "moderator"]), gelInfos)

export default router