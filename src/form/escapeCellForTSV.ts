export const escapeCellForTSV = (s: string): string => {
	if (typeof s !== 'string') return s
	let escaped = s.replace(/"/g, '""') // quote quotes
	if (escaped.includes('\n')) escaped = `"${escaped}"`
	return escaped
}
