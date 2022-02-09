import EventEmitter from 'events'
import { Transporter } from 'nodemailer'
import { events } from '../events.js'
import { appMailer } from './nodemailer.js'

describe('appMailer', () => {
  describe('should send an email with a token', () => {
    let sendMailMock: jest.Mock
    const omnibus = new EventEmitter()
    beforeEach(() => {
      sendMailMock = jest.fn()
      sendMailMock.mockImplementationOnce(async () => Promise.resolve())
      appMailer(omnibus, {
        transport: {
          sendMail: sendMailMock,
        } as unknown as Transporter<unknown>,
        fromEmail: 'no-reply@distributeaid.org',
      })
    })

    test.each([[events.user_registered]])('%s', (event) => {
      omnibus.emit(event, 'alex@example.com', '123456')
      expect(sendMailMock).toHaveBeenCalledWith({
        from: `"Distribute Aid Shipment Tracker" <no-reply@distributeaid.org>`,
        to: 'alex@example.com',
        subject: `Verification token: 123456`,
        text: `Hey 👋,\n\nPlease use the token 123456 to verify your email address.\n\nPlease do not reply to this email.\n\nIf you need support, please contact help@distributeaid.org.`,
      })
    })
  })
})
