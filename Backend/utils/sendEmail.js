import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
})

export const sendVerificationEmail = (email, token) => {
    const verificationUrl = `http://localhost:5001/api/v1/user/verify-email?token=${token}`;
    
    return transporter.sendMail({
       from: `CareerXpert ${process.env.EMAIL_USER}`,
       to: email,
       subject: "Verify your email",
       html: `<p>Please verify your email by clicking on the link below:</p>
            <a href="${verificationUrl}">Verify Email</a>`,
    }); 
};

export const sendEmail = async (options) => {

    // might need to change the email template later
    
    // setting up mail content 
    const mailOptions = {
        from: `CareerXpert ${process.env.EMAIL_USER}`, // Replace with your email or service email
        to: options.email,
        subject: options.subject,
        text: options.message, 
        // html: options.html, 
    };

    // send mail with defined transport object
    await transporter.sendMail(mailOptions);
};











