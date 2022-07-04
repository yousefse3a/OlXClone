const nodemailer = require("nodemailer");

async function sendEmail(dest, mess, attach) {
    let transporter = nodemailer.createTransport({
        service: "outlook",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: "yousefabusrea@outlook.com", // generated ethereal user
            pass: "01228103702@", // generated ethereal password
        },
    });
    if(! attach){
       var attach=[]
    }
    // if (attach) {
    //     console.log(attach)
    //     await transporter.sendMail({
    //         from: '"Fred Foo 👻" <yousefabusrea@outlook.com>', // sender address
    //         to: dest, // list of receivers
    //         subject: "logged", // Subject line
    //         text: "Hello world?", // plain text body
    //         html: mess, // html body
    //         attachments: attach
    //         //  [
    //         //     {
    //         //         filename: attach[0].name,
    //         //         path: attach[0].path
    //         //     }
    //         // ]
    //     });
    // } else {
        // send mail with defined transport object
        await transporter.sendMail({
            from: '"Fred Foo 👻" <yousefabusrea@outlook.com>', // sender address
            to: dest, // list of receivers
            subject: "logged", // Subject line
            text: "Hello world?", // plain text body
            html: mess, // html body
            attachments:attach
        });
    // }

}
module.exports = sendEmail