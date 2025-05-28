import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import adminRoute from './routes/admin.js'
import clientRoute from './routes/client.js'
import developernRoute from './routes/developer.js'
import homeRoute from './routes/home.js'
import messageRoute from './routes/message.js'
import notificationRoute from './routes/notification.js'
import paymentRoute from './routes/payment.js'
import userRoute from './routes/user.js'

import { PrismaClient } from '@prisma/client';


const app = express();
app.use(express.json());

app.use(cors({
    origin: '*', 
}));

dotenv.config();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mydatabase';


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


app.use('/admin',adminRoute)
app.use('/client',clientRoute)
app.use('/developer',developernRoute)
app.use('/home',homeRoute)
app.use('/message',messageRoute)
app.use('/notification',notificationRoute)
app.use('/payment',paymentRoute)
app.use('/user',userRoute)


app.use( (req, res,next) => {
  next(new Error(`${req.originalUrl} is not found `, 404));
});

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
      status: err.status || 'error',
      message: err.message || 'Internal Server Error',
  });
});


// note add trigger on payment (after insert) to calclaute (aggregate) total earning into freelancer_stats table ( to use it in developer dashboard) 