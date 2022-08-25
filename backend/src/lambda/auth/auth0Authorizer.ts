import { APIGatewayAuthorizerResult, APIGatewayTokenAuthorizerEvent } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
// import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'
import * as jwksClient from 'jwks-rsa'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

const logger = createLogger('auth')

const jwksUrl = 'https://dev-e42-52le.us.auth0.com/.well-known/jwks.json'
const client = jwksClient({
  jwksUri: jwksUrl,
  requestHeaders: {}, // Optional
  timeout: 30000 // Defaults to 30s
});

export const handler = middy(
  async (
    event: APIGatewayTokenAuthorizerEvent
  ): Promise<APIGatewayAuthorizerResult> => {
    logger.info('Authorizing a user', event.authorizationToken)
    try {
      const jwtToken = await verifyToken(event.authorizationToken)
      logger.info('User was authorized', jwtToken)

      return {
        principalId: jwtToken.sub,
        policyDocument: {
          Version: '2012-10-17',
          Statement: [
            {
              Action: 'execute-api:Invoke',
              Effect: 'Allow',
              Resource: '*'
            }
          ]
        }
      }
    } catch (e) {
      logger.error('User not authorized', { error: e.message })

      return {
        principalId: 'user',
        policyDocument: {
          Version: '2012-10-17',
          Statement: [
            {
              Action: 'execute-api:Invoke',
              Effect: 'Deny',
              Resource: '*'
            }
          ]
        }
      }
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )


async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  const kid = jwt.header.kid
  const key = await client.getSigningKey(kid)
  const signingKey = key.getPublicKey()

  return verify(token, signingKey) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
