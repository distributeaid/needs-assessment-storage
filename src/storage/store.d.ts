export type Store<T> = {
	persist: (id: string, data: T) => Promise<void>
	get: (id: string) => Promise<T | undefined>
}
