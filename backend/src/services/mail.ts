import nodemailer from "nodemailer";
import P from "bluebird"

class Mail {
    constructor(public to?: string, public subject?: string, public message?: string) {}

    async sendMail() {

        let mailOptions = {
            from: "paulgwebsite@gmail.com",
            to: this.to,
            subject: "Password Reset Request",
            html: this.message         
        }

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: "YOUDONTSEEIT",
                pass: "YOUREALLYDONTSEEIT"
            }
        })
        const transport = P.promisifyAll(transporter)
        

        // let sendMailAsync = promisify(transporter.sendMail)
        try {
            let data = await transport.sendMail(mailOptions)
            return "Successfully sent email."
        } catch (error) {
            return error
        }

    }
}

export default new Mail;