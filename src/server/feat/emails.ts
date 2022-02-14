import EventEmitter from 'events'
import { consoleMailer } from '../../mailer/console.js'
import { appMailer, transportFromConfig } from '../../mailer/nodemailer.js'

export const setUp = (omnibus: EventEmitter, adminEmails: string[]): void => {
	// Configure email sending
	const emailDebug = (...args: any) => console.debug('[email]', ...args)
	const maybeTransportConfig = transportFromConfig(emailDebug)
	if (maybeTransportConfig !== undefined) {
		appMailer(omnibus, maybeTransportConfig, adminEmails, emailDebug)
	} else {
		consoleMailer(omnibus, emailDebug)
	}
}
