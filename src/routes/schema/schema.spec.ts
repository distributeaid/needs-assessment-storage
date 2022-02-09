import { json } from 'body-parser'
import express, { Express } from 'express'
import { createServer, Server } from 'http'
import request, { SuperTest, Test } from 'supertest'
import { form } from '../../schema/form'
import { question } from '../../schema/question'
import { section } from '../../schema/section'
import { HTTPStatusCode } from '../../server/response/HttpStatusCode'
import { schemaHandler } from './schema'

describe('Schema API', () => {
  let app: Express
  let httpServer: Server
  let r: SuperTest<Test>

  beforeAll(async () => {
    app = express()
    app.use(json())
    app.get(
      '/schema/form.schema.json',
      schemaHandler(
        form({ baseURL: new URL('http://127.0.0.1:8889/schema/') }),
      ),
    )
    app.get(
      '/schema/section.schema.json',
      schemaHandler(
        section({ baseURL: new URL('http://127.0.0.1:8889/schema/') }),
      ),
    )
    app.get(
      '/schema/question.schema.json',
      schemaHandler(
        question({ baseURL: new URL('http://127.0.0.1:8889/schema/') }),
      ),
    )
    httpServer = createServer(app)
    await new Promise<void>((resolve) =>
      httpServer.listen(8889, '127.0.0.1', undefined, resolve),
    )
    r = request('http://127.0.0.1:8889')
  })
  afterAll(async () => {
    httpServer.close()
  })
  test('/schema/form.schema.json', async () => {
    const res = await r
      .get('/schema/form.schema.json')
      .expect(HTTPStatusCode.OK)
      .expect('Content-Type', /application\/schema\+json/)

    expect(res.body).toEqual(
      form({ baseURL: new URL('http://127.0.0.1:8889/schema/') }),
    )
    const formSchema = res.body
    expect(formSchema.properties.sections.items.$ref).toEqual(
      'http://127.0.0.1:8889/schema/section.schema.json',
    )
  })
  test('/schema/section.schema.json', async () => {
    const res = await r
      .get('/schema/section.schema.json')
      .expect(HTTPStatusCode.OK)
      .expect('Content-Type', /application\/schema\+json/)

    expect(res.body).toEqual(
      section({ baseURL: new URL('http://127.0.0.1:8889/schema/') }),
    )
    const sectionSchema = res.body
    expect(sectionSchema.properties.questions.items.$ref).toEqual(
      'http://127.0.0.1:8889/schema/question.schema.json',
    )
  })
  test('/schema/question.schema.json', async () => {
    const res = await r
      .get('/schema/question.schema.json')
      .expect(HTTPStatusCode.OK)
      .expect('Content-Type', /application\/schema\+json/)

    expect(res.body).toEqual(
      question({ baseURL: new URL('http://127.0.0.1:8889/schema/') }),
    )
  })
})
