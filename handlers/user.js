import catchAsync from "../Utilities/wrapperAsyncCatch.js"
import {convertBigIntsToStrings} from "../Utilities/saveJson.js"
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"



export const register = catchAsync(async (req, res, next) => {
    //req.body should have usertype [freelancer, client or modrator (the amdin role can add modrator )], firstName,
    // lastName, email, password, password, confirm password,
    // frelancer info (if usertype is freelancer) : years of exrpiance , experienced with gaming engines (from gaming enginges table)
    //req.body should have usertype [freelancer, client], firstName, lastName, email, password, confirmPassword,
    // freelancer info (if usertype is freelancer): yearsOfExperience, experiencedEngines
    const {
        usertype, firstName, lastName, email, password, confirmPassword,
        yearsOfExperience, experiencedEngines
    } = req.body;

    // Only allow freelancer/client for registration
    if (!["freelancer", "client"].includes(usertype)) {
        return res.status(400).json({ message: "Invalid usertype" });
    }
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
    }

    // If freelancer, ensure required fields are present
    if (usertype === "freelancer") {
        if (
            yearsOfExperience === undefined ||
            yearsOfExperience === null ||
            yearsOfExperience === "" ||
            !Array.isArray(experiencedEngines) ||
            experiencedEngines.length === 0
        ) {
            return res.status(400).json({ message: "yearsOfExperience and experiencedEngines are required for freelancers" });
        }
    }

    // Check for existing user
    const existing = await prisma.users.findUnique({ where: { email } });
    if (existing) {
        return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await prisma.$transaction(async (tx) => {
        // Create user
        const user = await tx.users.create({
            data: {
                first_name: firstName,
                last_name: lastName,
                email,
                password: hashedPassword,
                role: usertype
            }
        });

        // Create wallet
        await tx.wallets.create({
            data: {
                user_id: user.id,
                balance: 0,
                currency: "us_dollar"
            }
        });

        // If freelancer, create profile and connect engines
        if (usertype === "freelancer") {
            const freelancerProfile = await tx.freelancer_profile.create({
                data: {
                    user_id: user.id,
                    experience_years: Number(yearsOfExperience),
                    available: true
                }
            });

            for (const engineId of experiencedEngines) {
                await tx.freelancer_experienced_gaming_engines.create({
                    data: {
                        freelancer_id: freelancerProfile.id,
                        engine_id: Number(engineId)
                    }
                });
            }
        }

        // If client, create profile
        if (usertype === "client") {
            await tx.client_profile.create({
                data: {
                    user_id: user.id
                }
            });
        }

        return user;
    });

    res.status(201).json({
        message: "User registered successfully",
        user: {
            id: result.id.toString(),
            email: result.email,
            role: result.role
        }
    });

});


export const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // Sign JWT with id and role
    const token = jwt.sign(
        { id: user.id.toString(), role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    res.json({
        message: "Login successful",
        token,
        user: {
            id: user.id.toString(),
            email: user.email,
            role: user.role,
            first_name: user.first_name,
            last_name: user.last_name
        }
    });
});

export const gelInfos = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const user = await prisma.users.findUnique({
        where: { id: BigInt(id) },
        select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            role: true,
            created_at: true,
            updated_at: true,
            Freelancer_profile: true,
            client_profile: true,
        }
    });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // Convert BigInt fields to string
    
    const safeUser = convertBigIntsToStrings(user)
    return res.json(safeUser);
});


export const addMod = catchAsync(async (req, res, next) => {
    // Only admin should be able to call this (enforced by middleware)
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
    }

    // Check for existing user
    const existing = await prisma.users.findUnique({ where: { email } });
    if (existing) {
        return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.users.create({
        data: {
            first_name: firstName,
            last_name: lastName,
            email,
            password: hashedPassword,
            role: "moderator"
        }
    });

    res.status(201).json({
        message: "Moderator registered successfully",
        user: {
            id: user.id.toString(),
            email: user.email,
            role: user.role
        }
    });
});
