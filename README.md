# Storage for Needs Assessments

[![Test and Release](https://github.com/distributeaid/needs-assessment-storage/actions/workflows/test-and-release.yml/badge.svg)](https://github.com/distributeaid/needs-assessment-storage/actions/workflows/test-and-release.yml)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com)
[![Mergify Status](https://img.shields.io/endpoint.svg?url=https://gh.mergify.io/badges/DistributeAid/needs-assessment-storage)](https://mergify.io)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier/)
[![ESLint: TypeScript](https://img.shields.io/badge/ESLint-TypeScript-blue.svg)](https://github.com/typescript-eslint/typescript-eslint)

---

## Sponsors :heart:

[![rapidmail](https://raw.githubusercontent.com/distributeaid/needs-assessment-storage/saga/docs/sponsor-rapidmail.png)](https://www.rapidmail.com/)

Transactional email sending sponsored by
[rapidmail](https://www.rapidmail.com/).

---

This is the storage backend for Distribute Aid Needs Assessments. The main goal
of this project is to provide a flexible way to

1. define needs assessment forms and
2. store the responses for these forms.

## Development

```
npm ci
npm test
npm start
```

## Forms

> :information_source: The UI that displays forms is implemented in the
> [needs assessment](https://github.com/distributeaid/needs-assessment) project.

Forms are a set of questions, that have to be answered. They are defined as a
JSON document and must follow [this schema](./src/schema/form.ts). The schema is
served under `/schema` on the running instance.

A minimal form definition looks like this:

```json
{
  "$schema": "http://localhost:3000/schema/0.0.0-development/form#",
  "sections": [
    {
      "id": "aboutYou",
      "title": "About you",
      "questions": [
        {
          "id": "name",
          "title": "What is your name?",
          "required": true,
          "format": {
            "type": "text"
          }
        }
      ]
    }
  ]
}
```

This defines a form with one section, and the required question for the name of
the user.

### Advanced form logic

Sections can be hidden, and questions can be hidden and required based on
[JSONata](https://jsonata.org/) expressions. The expression will be evaluated
against the contents of the response and must evaluate to `true` or `false`.
This allows to hide sections of the form based on an answer in an earlier
section.

Consider this example:

```json
{
  "$schema": "http://localhost:3000/schema/0.0.0-development/form#",
  "$id": "http://localhost:3000/form/example",
  "sections": [
    {
      "id": "additional",
      "title": "Additional Information",
      "questions": [
        {
          "id": "needOtherItems",
          "title": "Are there any other items you need?",
          "required": true,
          "format": {
            "type": "single-select",
            "style": "radio",
            "options": [
              {
                "id": "yes",
                "title": "yes"
              },
              {
                "id": "no",
                "title": "no"
              }
            ]
          }
        },
        {
          "id": "otherItemsNeeded",
          "title": "Please describe the other items you need:",
          "hidden": "$not($exists(additional.needOtherItems)) or additional.needOtherItems = 'no'",
          "required": "additional.needOtherItems = 'yes'",
          "format": {
            "type": "text",
            "multiLine": true
          }
        }
      ]
    }
  ]
}
```

It defines the single choice question `additional.needOtherItems` (_Are there
any other items you need?_) which user can answer with `yes` or `no`. The
definition for the second question has a JSONata expression for both `hidden`
and `required`. The `hidden` expression will evaluate to `true` (resulting in
the input field to be hidden), if no answer was given, yet (in this case the
value in the response will not be defined), or if the answer is `no`. Only if
the answer is `yes`, will the question be made mandatory.

## Responses

In order for assessments to be stored, the form needs to be created first.
Storing above form is done by sending a POST request to `/form`:

```bash
http POST http://localhost:3000/form <<< '{"$schema":"http://localhost:3000/schema/0.0.0-development/form#","sections":[{"id":"aboutYou","title":"About you","questions":[{"id":"name","title":"What is your name?","required":true,"format":{"type":"text"}}]}]}'
```

This will store the form as a new entry, and return the URL to it in the
`location` header:

```
HTTP/1.1 201 Created
Location: http://localhost:3000/form/01FVZQH3NRPW38JSMD63KCM043
```

`http://localhost:3000/form/01FVZQH3NRPW38JSMD63KCM043` must now be referenced
in the response. This will cause the response to be validated against the form.

The response is submitted to `/assessment`:

```bash
http POST http://localhost:3000/assessment <<< '{"form":"http://localhost:3000/form/01FVZQH3NRPW38JSMD63KCM043","response":{"aboutYou":{"name":"Alex Doe"}}}'
```

If the response is valid, it will be stored locally.

## Notification about new assessments

Assessments will be sent to the configured admin email addresses, and include a
TSV file of the assessment.

Configure the `ADMIN_EMAILS` environment variable with a comma-separated list of
emails. In addition, configure the SMTP settings using environment variables for
sending out emails:

```bash
export SMTP_FROM=... # e.g. user@example.com
export SMTP_SERVER=... # e.g. example.com
export SMTP_USER=... # e.g. user@example.com
export SMTP_PASSWORD=... # e.g. secret
export SMTP_SECURE=... # e.g. false
export SMTP_PORT=... # e.g. 587
```

## Storage

Forms and responses are stored on the local filesystem. When using Clever Cloud,
[file system buckets](https://www.clever-cloud.com/doc/deploy/addon/fs-bucket/)
are used and mounted at deploy time to store the JSON files with the forms and
responses.

The mount point on the production instance is configured via the
[`CC_FS_BUCKET` environment variable](https://www.clever-cloud.com/blog/features/2017/09/22/fs-bucket-environment-variable/)
of the instance.
