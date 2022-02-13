import EventEmitter from 'events'
import { events } from '../events.js'

export const consoleMailer = (
	omnibus: EventEmitter,
	debug: (...args: any[]) => void,
): void => {
	omnibus.on(events.user_registered, (email: string, token: string) => {
		debug(`${email}: confirmation token ${token}`)
	})
	omnibus.on(events.assessment_created, (id: string) => {
		debug(`Assessment ${id} created.`)
	})
}
