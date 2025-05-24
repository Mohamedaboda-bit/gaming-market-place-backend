import catchAsync from "../Utilities/wrapperAsyncCatch.js"

export const getWebsiteData =catchAsync(async (req, res, next)=>{
    // should return :
    // 1.number of all current users and created at (for the number of users joined past week)
    // 2.number of pending and active projects
    // 3.all the current money in the website ( in ecrows table)
    // 4.number of all projects
    // 5.number of completed projects
    // number of freelancers
    // number of cleints
    // number of used gaming engines in all project for example : 100 project used utlity gaming engine should perview utilty : 100
    // latest 3 notifcations
    // all the pending projects for review
    // latest users joined
    // latest in and out from ecrows

})

export const getClients =catchAsync(async (req, res, next)=>{
    // should return all the clients infos from 
})

export const getFreelancers =catchAsync(async (req, res, next)=>{
    // should return all the clients infos from 
})

export const getProject =catchAsync(async (req, res, next)=>{
    // should return all latest 100 projects 
    // each active, completed and canceled projects should have freelancer name 
})
