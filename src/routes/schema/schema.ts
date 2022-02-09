import { Request, Response } from 'express'

export const schemaHandler =
  (schema: Record<string, any>) =>
  async (_: Request, response: Response): Promise<void> => {
    response
      .header('Content-Type', 'application/schema+json; charset=utf-8')
      .send(schema)
      .end()
  }
