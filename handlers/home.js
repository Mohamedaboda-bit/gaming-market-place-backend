import catchAsync from "../Utilities/wrapperAsyncCatch.js"

export const TOP3 = catchAsync(async (req, res, next)=>{
    //should return top freelancers, lastest projects, gaming engines in case of guest or admin
    //should return lastest projects, gaming engines in case of freelancer
    //should return top freelancers, gaming engines in case of freelancer
})
