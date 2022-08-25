import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getImagesForUser } from '../../helpers/images';
import { getUserId } from '../utils';
import { ImageItem } from '../../models/ImageItem';

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const images: ImageItem[] = await getImagesForUser(getUserId(event))

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ items: images })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
