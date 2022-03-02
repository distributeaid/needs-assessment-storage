export type Store<T> = {
	persist: (id: string, data: T) => Promise<void>
	get: (id: string) => Promise<{ id: string; data: T } | undefined>
	findAll: (
		search: Record<string, string>,
	) => Promise<{ id: string; data: T }[]>
}
