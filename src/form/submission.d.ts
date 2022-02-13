export type Response = Record<string, Record<string, string | string[]>>

export type Submission = {
	form: string
	response: Response
}
