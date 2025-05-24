import catchAsync from "../Utilities/wrapperAsyncCatch.js"


export const getAll = catchAsync(async (req, res, next)=>{
    // should return developer related projects, proposels, avaialbe projects and latest payments to wallet
})

export const getProjects = catchAsync(async (req, res, next)=>{
    // should return developer avtice project and completed ones and the gaming enginges, rate, completed at cleint name and money in each completed project
    // in active projects should return number of complted phases if there is any and the client name 
})

export const getProposals = catchAsync(async (req, res, next)=>{
    // should return developer proposals 
})

export const getOneProposal = catchAsync(async (req, res, next)=>{
    // should return developer spacific proposal
})

export const ActiveProjects = catchAsync(async (req, res, next)=>{
    // should return developer active project
})

export const getOneProjects = catchAsync(async (req, res, next)=>{
    // should return one of the develpoer related project project
})



export const getDetails =catchAsync(async (req, res, next)=>{
    // logic of getting current balance in wallet, total earining(developr), pinding money in escrows pinding money from transtionss and all transtions histroy
})




