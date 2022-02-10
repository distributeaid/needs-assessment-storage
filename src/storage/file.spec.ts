import { promises as fs } from 'fs'
import * as os from 'os'
import * as path from 'path'
import { ulid } from '../ulid'
import { jsonFileStore } from './file'
import { Store } from './store'

describe('File store', () => {
	let store: Store<any>
	let tmpDir: string
	let id: string
	beforeAll(async () => {
		tmpDir = await fs.mkdtemp(`${os.tmpdir()}${path.sep}`)
		store = jsonFileStore<any>({ directory: tmpDir })
		id = ulid()
	})
	afterAll(async () => {
		await fs.rm(tmpDir, { recursive: true })
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
			expect(await store.get(id)).toMatchObject({ foo: 'bar' }))
		it('should reject invalid ids', async () =>
			expect(store.get('unknown')).rejects.toThrow('Invalid id: unknown!'))
		it('should return undefined for unknown files', async () =>
			expect(await store.get(ulid())).toBeUndefined())
	})
})
