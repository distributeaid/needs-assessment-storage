# Authentication

The backend authenticates requests using signed cookies which contains user's id
so that it does not have to be fetched for every request.

Cookies are sent
[`secure` and `HttpOnly`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#restrict_access_to_cookies)
when users log in using email and a verification token.

Cookies expire after 30 minutes and the client is responsible for renewing
cookies by calling the `POST /cookie` endpoint before they expire.

Renewing cookies is possible as long as the user's cookie is valid.

## Admin permissions

Admin permission are granted by adding the lower-case email of the user to the
`ADMIN_EMAILS` environment variable.

## Configuration

These environment variables control the authentication:

- `COOKIE_SECRET`: sets the secret used to sign cookies, default value is a
  random string
- `COOKIE_LIFETIME_SECONDS`: sets the cookie lifetime in seconds, default value
  is `'1800'` (5 minutes)
- `ADMIN_EMAILS`: comma-separated list of email addresses (lower-case) of users
  with admin permissions
