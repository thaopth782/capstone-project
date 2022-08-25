import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateImageRequest } from '../../requests/CreateImageRequest'
import { getUserId } from '../utils';
import { createImage } from '../../helpers/images'
import { ImageItem } from '../../models/ImageItem'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newImage: CreateImageRequest = JSON.parse(event.body)

    const userId = getUserId(event)

    const imageItem: ImageItem = await createImage(userId, newImage)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ item: imageItem })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
