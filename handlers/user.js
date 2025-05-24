import catchAsync from "../Utilities/wrapperAsyncCatch.js"


export const register = catchAsync(async (req, res, next)=>{
    //req.body should have usertype [freelancer, client or modrator (the amdin role can add modrator )], firstName,
    // lastName, email, password, password, confirm password,
    // frelancer info (if usertype is freelancer) : years of exrpiance , experienced with gaming engines (from gaming enginges table)
})

export const login = catchAsync(async (req, res, next)=>{
    // should login with email and password
})

export const gelInfos = catchAsync(async (req, res, next)=>{
    // should get all users info
})


