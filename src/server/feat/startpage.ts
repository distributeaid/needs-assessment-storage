import { Application } from 'express'
import * as fs from 'fs'
import * as path from 'path'
import { URL } from 'url'

const { homepage } = JSON.parse(
	fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'),
)

export const startpage = (
	app: Application,
	endpoint: URL,
	version: string,
): void => {
	const schemaURL = new URL(`./schema/`, endpoint)
	const versionedSchemaURL = new URL(`./schema/${version}/form#`, endpoint)
	const submitFormURL = new URL(`./form`, endpoint)

	app.get('/', (_, res) => {
		res
			.header('Content-type', 'text/html; charset=utf-8')
			.send(
				`<!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="X-UA-Compatible" content="ie=edge">
                <title>Distribe Aid Needs Assessment Storage</title>
              </head>
              <body>
              <h1>Distribute Aid Needs Assessment Storage</h1>
              <ul>
                <li><a href="${homepage}" target="_blank">README</a></li>
              </ul>
              <h2>Get the schema</h2>
              <p><a href="${schemaURL}" target="_blank">${schemaURL}</a> -&gt; <a href="${versionedSchemaURL}" target="_blank">${versionedSchemaURL}</a></p>
              <h2>Submit a new form</h2>
			  <ul>
				<li><a href="/form/example" target="_blank">Full example form</a></li>
				</ul>
              <pre>http POST ${submitFormURL} &lt;&lt;&lt; '${JSON.stringify({
					$schema: versionedSchemaURL.toString(),
					sections: [
						{
							id: 'section1',
							title: 'Section 1',
							questions: [
								{
									id: 'question1',
									title: 'Question 1',
									format: {
										type: 'text',
									},
								},
							],
						},
					],
				})}'</pre>
              <pre>HTTP/1.1 201 Created\nLocation: http://localhost:3000/form/01FVZQH3NRPW38JSMD63KCM043</pre>
              <h2>Submit a new assessment for the form</h2>
			  <ul>
				<li><a href="/assessment/example" target="_blank">Assessment example for full example form</a></li>
			  </ul>
              <pre>http POST http://localhost:3000/assessment &lt;&lt;&lt; '${JSON.stringify(
								{
									form: 'http://localhost:3000/form/01FVZQH3NRPW38JSMD63KCM043',
									response: {
										section1: {
											question1: 'Answer',
										},
									},
								},
							)}'</pre>
				<hr/>
				<p>Version: ${version}</p>
              </body>
            </html>`,
			)
			.end()
	})
}
