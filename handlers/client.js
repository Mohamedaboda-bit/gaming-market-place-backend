import catchAsync from "../Utilities/wrapperAsyncCatch.js"

export const getAll =catchAsync(async (req, res, next)=>{
    // logic of getting all client related projects, proposesl, latest payments, latest noticcations
})

export const getAllProjects =catchAsync(async (req, res, next)=>{
    // logic of getting all client related projects
})

export const getCanvos =catchAsync(async (req, res, next)=>{
    // logic of getting all client related conversations
})

export const getPayments =catchAsync(async (req, res, next)=>{
    // logic of getting all client related payments, money trancstions and number of active project
})


