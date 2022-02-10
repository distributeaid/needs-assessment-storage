/**
 * Calculates a stable port number based on the given string
 */
export const portForTest = (testName: string): number => {
	let hash = 0
	for (let i = 0; i < testName.length; i++) {
		hash = (hash << 5) - hash + testName.charCodeAt(i)
		hash |= 0 // Convert to 32bit integer
	}
	return 1024 + Math.round((Math.abs(hash) / Math.pow(2, 31)) * (65535 - 1024))
}
