import { tempJsonFileStore } from '../test/tempJsonFileStore.js'
import { ulid } from '../ulid.js'
import { Store } from './store.js'

describe('File store', () => {
	let store: Store<any>
	let id: string
	let cleanup: () => Promise<void>
	beforeAll(async () => {
		const { store: s, cleanup: c } = await tempJsonFileStore<any>()
		cleanup = c
		store = s
		id = ulid()
	})
	afterAll(async () => {
		await cleanup()
	})

	describe('persist()', () => {
		it('should write a file', async () =>
			expect(async () => store.persist(id, { foo: 'bar' })).not.toThrow())
		it('should reject invalid ids', async () =>
			expect(store.persist('foo', { foo: 'bar' })).rejects.toThrow(
				'Invalid id: foo!',
			))
	})

	describe('get()', () => {
		it('should retrieve a file', async () =>
			expect(await store.get(id)).toMatchObject({ id, data: { foo: 'bar' } }))
		it('should reject invalid ids', async () =>
			expect(store.get('unknown')).rejects.toThrow('Invalid id: unknown!'))
		it('should return undefined for unknown files', async () =>
			expect(await store.get(ulid())).toBeUndefined())
	})

	describe('findAll()', () => {
		it('should find all matchin files', async () => {
			const someValue = ulid()
			await store.persist(ulid(), { foo: someValue })
			await store.persist(ulid(), { foo: someValue })
			await store.persist(ulid(), { foo: 'baz' })
			expect(await store.findAll({ foo: someValue })).toHaveLength(2)
		})
	})
})
