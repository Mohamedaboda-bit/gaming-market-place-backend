import jwt from "jsonwebtoken"
import catchAsync from "../Utilities/wrapperAsyncCatch.js"

export const isAuthenticated = catchAsync(async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        return next(new Error("Authentication required: No token provided"));
    }
        const decoded = jwt.verify(authHeader, process.env.JWT_SECRET);

        req.user = { id: decoded.id , role: decoded.role};

        next();
});

export const authorizeRoles = (roles) => catchAsync(async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        return next(new Error("Authentication required: No token provided"));
    }
    const decoded = jwt.verify(authHeader, process.env.JWT_SECRET);
    if (!roles.includes(decoded.role)) {
        return res.status(403).json({ message: "Not authorized" });
    }
    next();
});