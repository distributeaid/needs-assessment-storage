import { Static } from '@sinclair/typebox'
import EventEmitter from 'events'
import { Transporter } from 'nodemailer'
import { events } from '../events.js'
import { Form } from '../form/form.js'
import { responseToTSV } from '../form/responseToTSV.js'
import { Submission } from '../form/submission.js'
import { formSchema } from '../schema/form.js'
import { ulid } from '../ulid.js'
import { appMailer } from './nodemailer.js'

describe('appMailer', () => {
	describe('should send an email with a token', () => {
		let sendMailMock: jest.Mock
		const omnibus = new EventEmitter()
		beforeEach(() => {
			sendMailMock = jest.fn()
			sendMailMock.mockImplementationOnce(async () => Promise.resolve())
			appMailer(
				omnibus,
				{
					transport: {
						sendMail: sendMailMock,
					} as unknown as Transporter<unknown>,
					fromEmail: 'no-reply@distributeaid.org',
				},
				['needs@distributeaid.org'],
			)
		})

		test(events.user_registered, () => {
			omnibus.emit(events.user_registered, 'alex@example.com', '123456')
			expect(sendMailMock).toHaveBeenCalledWith({
				from: `"Distribute Aid Needs Assessment" <no-reply@distributeaid.org>`,
				to: 'alex@example.com',
				subject: `Verification token: 123456`,
				text: `Hey 👋,\n\nPlease use the token 123456 to verify your email address.\n\nPlease do not reply to this email.\n\nIf you need support, please contact help@distributeaid.org.`,
			})
		})

		test(events.assessment_created, () => {
			const formId = ulid()
			const form$Id = new URL(`https://example.com/form/${formId}`).toString()
			const simpleForm: Form = {
				$schema: formSchema({
					$id: new URL('https://example.com/schema/'),
				}).$id,
				$id: form$Id,
				sections: [
					{
						id: 'section1',
						title: 'Section 1',
						questions: [
							{
								id: 'question1',
								title: 'Question 1',
								required: true,
								format: {
									type: 'text',
								},
							},
						],
					},
				],
			}
			const submission: Static<typeof Submission> = {
				form: simpleForm.$id,
				response: {
					section1: {
						question1: 'Answer',
					},
				},
			}
			const submissionId = ulid()
			omnibus.emit(
				events.assessment_created,
				submissionId,
				submission,
				simpleForm,
			)
			expect(sendMailMock).toHaveBeenCalledWith({
				from: `"Distribute Aid Needs Assessment" <no-reply@distributeaid.org>`,
				to: 'needs@distributeaid.org',
				subject: `[form:${formId}] New submission received (${submissionId})`,
				text: `A new needs assessment form was filled.\nForm: ${form$Id}`,
				attachments: [
					{
						content: responseToTSV(submission.response, simpleForm),
						contentType: 'text/tsv; charset=utf-8',
						filename: `form-${formId}-submission-${submissionId}.tsv`,
					},
				],
			})
			expect(sendMailMock).toHaveBeenCalledTimes(1)
		})
	})
})
