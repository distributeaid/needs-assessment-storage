export const verificationTokenStorage = (): {
	set: ({ email, token }: { email: string; token: string }) => void
	get: ({ email }: { email: string }) => string | undefined
} => {
	const storage: Record<string, string> = {}
	return {
		set: ({ email, token }: { email: string; token: string }) => {
			storage[email.toLowerCase()] = token
		},
		get: ({ email }: { email: string }) => storage[email.toLowerCase()],
	}
}

export const VerificationToken = verificationTokenStorage()
