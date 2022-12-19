import { Static } from '@sinclair/typebox'
import EventEmitter from 'events'
import { Transporter } from 'nodemailer'
import { AuthContext } from '../authenticateRequest.js'
import { events } from '../events.js'
import { Correction } from '../form/correction.js'
import { Form } from '../form/form.js'
import { responseToTSV } from '../form/responseToTSV.js'
import { Submission } from '../form/submission.js'
import { formSchema } from '../schema/form.js'
import { ulid } from '../ulid.js'
import { appMailer } from './nodemailer.js'

describe('appMailer', () => {
	describe('should send an email with a token', () => {
		let sendMailMock: jest.Mock
		let sendMailCallPromise: Promise<void>
		const omnibus = new EventEmitter()
		beforeEach(() => {
			sendMailMock = jest.fn()
			sendMailCallPromise = new Promise((resolve) => {
				sendMailMock.mockImplementationOnce(async () => {
					resolve()
					return Promise.resolve()
				})
			})
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

		test(events.user_registered, async () => {
			omnibus.emit(events.user_registered, 'alex@example.com', '123456')
			await sendMailCallPromise
			expect(sendMailMock).toHaveBeenCalledWith({
				from: `"Distribute Aid Needs Assessment" <no-reply@distributeaid.org>`,
				to: 'alex@example.com',
				subject: `Verification token: 123456`,
				text: [
					'Hey 👋,',
					'',
					'Please use the token 123456 to verify your email address.',
					'',
					'Please do not reply to this email.',
					'',
					'If you need support, please contact help@distributeaid.org.',
				].join('\n'),
			})
		})

		test(events.assessment_created, async () => {
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
			const submission$Id = new URL(
				`https://example.com/submission/${submissionId}`,
			).toString()
			omnibus.emit(
				events.assessment_created,
				submissionId,
				submission$Id,
				submission,
				simpleForm,
			)
			await sendMailCallPromise
			expect(sendMailMock).toHaveBeenCalledWith({
				from: `"Distribute Aid Needs Assessment" <no-reply@distributeaid.org>`,
				to: 'needs@distributeaid.org',
				subject: `[form:${formId}] New submission received (${submissionId})`,
				text: [
					'A new needs assessment form was filled.',
					`Form: ${form$Id}`,
					`Submission: ${submission$Id}`,
				].join('\n'),
				attachments: [
					{
						content: await responseToTSV(submission.response, simpleForm),
						contentType: 'text/tsv; charset=utf-8',
						filename: `form-${formId}-submission-${submissionId}.tsv`,
					},
				],
			})
			expect(sendMailMock).toHaveBeenCalledTimes(1)
		})

		test(events.correction_created, async () => {
			const authContext: AuthContext = {
				email: 'admin@example.com',
				isAdmin: true,
			}
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
							{
								id: 'question2',
								title: 'Question 2',
								required: true,
								format: {
									type: 'text',
								},
							},
						],
					},
					{
						id: 'section2',
						title: 'Section 2',
						questions: [
							{
								id: 'question1',
								title: 'Question 1',
								required: true,
								format: {
									type: 'text',
								},
							},
							{
								id: 'question2',
								title: 'Question 2',
								required: true,
								format: {
									type: 'text',
								},
							},
						],
					},
				],
			}

			const submissionId = ulid()
			const submission$Id = new URL(
				`https://example.com/submission/${submissionId}`,
			).toString()
			const submission: Static<typeof Submission> = {
				form: simpleForm.$id,
				response: {
					section1: {
						question1: 'Answer 1',
						question2: 'Answer 2',
					},
					section2: {
						question1: 'Answer 1',
						question2: 'Answer 2',
					},
				},
			}
			const correctionId = ulid()
			const correction: Static<typeof Correction> = {
				form: simpleForm.$id,
				submission: submission$Id,
				submissionVersion: 1,
				response: {
					section1: {
						question1: 'Answer 1',
						question2: 'Answer 2',
					},
					section2: {
						question1: 'Answer 1',
						question2: 'Answer 2 (corrected)',
					},
				},
				author: authContext.email,
			}
			omnibus.emit(
				events.correction_created,
				correctionId,
				correction,
				simpleForm,
				new URL(submission$Id),
				submission,
			)

			await sendMailCallPromise
			expect(sendMailMock).toHaveBeenCalledWith({
				from: `"Distribute Aid Needs Assessment" <no-reply@distributeaid.org>`,
				to: 'needs@distributeaid.org',
				subject: `[submission:${submissionId}] New correction by admin@example.com received (${correctionId})`,
				text: [
					'A needs assessment submission was corrected by admin@example.com.',
					`Form: ${form$Id}`,
					`Submission: ${submission$Id} (v1)`,
					'',
					'Changes:',
					'- Section 2: Question 2',
					'  OLD: Answer 2',
					'  NEW: Answer 2 (corrected)',
					'',
				].join('\n'),
				attachments: [
					{
						content: await responseToTSV(submission.response, simpleForm),
						contentType: 'text/tsv; charset=utf-8',
						filename: `form-${formId}-submission-${submissionId}-correction-${correctionId}.tsv`,
					},
				],
			})
			expect(sendMailMock).toHaveBeenCalledTimes(1)
		})
	})
})
