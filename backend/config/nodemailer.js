import nodemailer from "nodemailer";

let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for SSL
    auth: {
        user: "filliaspprt@gmail.com",
        pass: "jixa brvi qjks aczy",
    },
});

export default transporter;