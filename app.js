require('dotenv').config();
const express = require('express');
const connectDB = require('./connections/DBconnectio');
const router = require('./modules/index');
const schedule = require('node-schedule');
const { getProductsToday } = require('./modules/product/controller/Profile');
const { sendEmailToAdmin } = require('./modules/user/controller/profile');
const { initIO } = require('./services/socket');
const { userModel } = require('./models/UserModel');


const app = express();
app.use(express.json());
connectDB();
app.use(router.auth, router.user, router.product, router.comment);


const job = schedule.scheduleJob('59 59 23 * * *', async function () {
    const pdfName = await getProductsToday();
    sendEmailToAdmin(pdfName);
    console.log('send new products to admins')
});


const server = app.listen(process.env.PORT, () => {
    console.log(`running on port ${process.env.PORT}`)
});

const io=initIO(server);
io.on('connection',(socket)=>{

    socket.on('updateUserSoket',async (data)=>{
        await userModel.findByIdAndUpdate({_id:data._id},{socketID:socket.id})
    })
    console.log(socket.id)
})

