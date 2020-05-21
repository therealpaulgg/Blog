import nodemailer from "nodemailer"
import P from "bluebird"

class Mail {
    constructor(public to?: string, public subject?: string, public message?: string) { }

    public async sendMail() {

        const mailOptions = {
            sender: process.env.EMAIL,
            from: "Blog",
            to: this.to,
            subject: "Password Reset Request",
            html: this.message
        }

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT),
            secure: Number(process.env.EMAIL_PORT) === 465,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        })
        const transport = P.promisifyAll(transporter)


        // let sendMailAsync = promisify(transporter.sendMail)
        try {
            await transport.sendMail(mailOptions)
            return "Successfully sent email."
        } catch (error) {
            return error
        }

    }
}

export default new Mail()
