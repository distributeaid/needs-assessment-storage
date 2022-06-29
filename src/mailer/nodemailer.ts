import { Static } from '@sinclair/typebox'
import EventEmitter from 'events'
import nodemailer, { Transporter } from 'nodemailer'
import { Attachment } from 'nodemailer/lib/mailer'
import { AuthContext } from '../authenticateRequest.js'
import { events } from '../events.js'
import { Correction } from '../form/correction.js'
import { Form } from '../form/form.js'
import { responseToTSV } from '../form/responseToTSV.js'
import { Submission } from '../form/submission.js'
import { ulidRegEx } from '../ulid.js'

/**
 * SMTP hostname, e.g. "smtp.net"
 */
const host = process.env.SMTP_SERVER

/**
 * SMTP port, defaults to 587
 */
const port = parseInt(process.env.SMTP_PORT ?? '587', 10)

/**
 * Whether to use a secure connection, defaults to false
 */
const secure = (process.env.SMTP_SECURE ?? 'false') === 'true'

/**
 * SMTP username
 */
const user = process.env.SMTP_USER

/**
 * SMTP password
 */
const pass = process.env.SMTP_PASSWORD

/**
 * The email sender, in the form `"<name>" <email>`, e.g. `"Distribute Aid Needs Assessment" <no-reply@needs-assessment-storage.distributeaid.org>`
 */
const fromEmail = process.env.SMTP_FROM

const canSendEmails =
	[host, port, secure, user, pass, fromEmail].filter((v) => v === undefined)
		.length === 0

export const transportFromConfig = (
	debug?: (...args: any[]) => void,
):
	| {
			transport: Transporter<unknown>
			fromEmail: string
	  }
	| undefined => {
	if (canSendEmails) {
		debug?.(`Sending of emails ENABLED via ${host}!`)
		return {
			transport: nodemailer.createTransport({
				host,
				port,
				secure,
				auth: {
					user: process.env.SMTP_USER,
					pass: process.env.SMTP_PASSWORD,
				},
			}),
			fromEmail: fromEmail as string,
		}
	}
	console.error(`⚠️ Sending of emails DISABLED!`)
	return undefined
}

type Email = {
	subject: string
	text: string
	attachments?: Attachment[]
}

export const verificationEmail = (token: string): Email => ({
	subject: `Verification token: ${token}`,
	text: `Hey 👋,\n\nPlease use the token ${token} to verify your email address.\n\nPlease do not reply to this email.\n\nIf you need support, please contact help@distributeaid.org.`,
})

export const adminSubmissionNotificationEmail = (
	id: string,
	submission: Static<typeof Submission>,
	form: Form,
): Email => {
	const formId = ulidRegEx.exec(form.$id)?.[0]
	return {
		subject: `[form:${formId}] New submission received (${id})`,
		text: [`A new needs assessment form was filled.`, `Form: ${form.$id}`].join(
			'\n',
		),
		attachments: [
			{
				contentType: 'text/tsv; charset=utf-8',
				filename: `form-${formId}-submission-${id}.tsv`,
				content: responseToTSV(submission.response, form),
			},
		],
	}
}

export const adminCorrectionNotificationEmail = (
	id: string,
	_: Static<typeof Correction>,
	submission$Id: URL,
	submission: Static<typeof Submission>,
	form: Form,
	authContext: AuthContext,
): Email => {
	const formId = ulidRegEx.exec(form.$id)?.[0]
	const submissionId = ulidRegEx.exec(submission$Id.toString())?.[0]
	return {
		subject: `[submission:${submissionId}] New correction by ${authContext.email} received (${id})`,
		text: [
			`A needs assessment submission was corrected by ${authContext.email}.`,
			`Form: ${form.$id}`,
			`Submission: ${submission$Id}`,
			`Changes:`,
		].join('\n'),
		attachments: [
			{
				contentType: 'text/tsv; charset=utf-8',
				filename: `form-${formId}-submission-${submissionId}-correction-${id}.tsv`,
				content: responseToTSV(submission.response, form),
			},
		],
	}
}

export const appMailer = (
	omnibus: EventEmitter,

	{
		transport,
		fromEmail,
	}: {
		transport: Transporter<unknown>
		fromEmail: string
	},
	adminEmails: string[],
	debug?: (...args: any[]) => void,
): void => {
	const from = `"Distribute Aid Needs Assessment" <${fromEmail}>`

	const sendMail = async (to: string, data: Email) => {
		debug?.(`> ${to}: ${data.subject}`)
		try {
			await transport.sendMail({
				...data,
				from,
				to,
			})
			debug?.('> message sent')
		} catch (error) {
			console.error(`Failed to sent email: ${(error as Error).message}`)
			console.error(error)
		}
	}

	omnibus.on(events.user_registered, async (email: string, token: string) =>
		sendMail(email, verificationEmail(token)),
	)

	omnibus.on(
		events.assessment_created,
		async (id: string, submission: Static<typeof Submission>, form: Form) => {
			const data = adminSubmissionNotificationEmail(id, submission, form)
			await Promise.all(adminEmails.map(async (email) => sendMail(email, data)))
		},
	)

	omnibus.on(
		events.correction_created,
		async (
			id: string,
			correction: Static<typeof Correction>,
			form: Form,
			submissionId: URL,
			submission: Static<typeof Submission>,
			authContext: AuthContext,
		) => {
			const data = adminCorrectionNotificationEmail(
				id,
				correction,
				submissionId,
				submission,
				form,
				authContext,
			)
			await Promise.all(adminEmails.map(async (email) => sendMail(email, data)))
		},
	)
}
