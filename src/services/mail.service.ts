import * as nodemailer from 'nodemailer';

class MailService {
	transporter;

	constructor() {
		this.transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST,
			port: process.env.SMTP_PORT,
			secure: false,
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASSWORD
			}
		} as nodemailer.TransportOptions);
	}

	async sendActivationMail(to: string, link: string) {
		await this.transporter.sendMail({
			from: `"Auth service" ${process.env.SMTP_USER}`,
			to,
			subject: `Account activation on SITE NAME ${process.env.CLIENT_URL}`,
			text: '', //Пусто т.к. отправляем html
			html: `
				<div>
					<h1>To activate, follow the link:</h1>
					<a href="${link}">${link}</a>
				</div>
			`
		});
	}
}

export const mailService = new MailService();
