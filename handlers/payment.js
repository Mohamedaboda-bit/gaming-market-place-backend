import catchAsync from "../Utilities/wrapperAsyncCatch.js"

export const depositToWallet =catchAsync(async (req, res, next)=>{
    // logic of adding money to the playform wallet using using one of the client saved payments methods 
})

export const addPaymentMethod =catchAsync(async (req, res, next)=>{
    // logic of adding a new payment method to user payment methods 
    // use oAuth incase of paypal and find how moyasr works
})


