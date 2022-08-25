import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { ImageItem } from '../models/ImageItem'
import { ImageUpdate } from '../models/ImageUpdate';

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

export class ImagesAccess {
  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly imagesTable = process.env.IMAGES_TABLE
  ) { }

  async getAllByUserId(userId: string): Promise<ImageItem[]> {
    const result = await this.docClient
      .query({
        TableName: this.imagesTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()

    const items = result.Items
    return items as ImageItem[]
  }

  async create(imageItem: ImageItem): Promise<ImageItem> {
    await this.docClient
      .put({
        TableName: this.imagesTable,
        Item: imageItem
      })
      .promise()

    return imageItem
  }

  async update(imageItem: ImageUpdate, userId: string, imageId: string) {
    var params = {
      TableName: this.imagesTable,
      Key: {
        userId,
        imageId
      },
      UpdateExpression: 'SET #n = :name',
      ExpressionAttributeValues: {
        ':name': imageItem.name,
      },
      ExpressionAttributeNames: {
        '#n': 'name'
      },
      ReturnValues: 'UPDATED_NEW'
    }

    return await this.docClient.update(params).promise()
  }

  async delete(userId: string, imageId: string) {
    return await this.docClient.delete({
      TableName: this.imagesTable,
      Key: {
        userId,
        imageId,
      }
    }).promise()
  }

  async updateAttachmentUrl(userId: string, imageId: string, attachmentUrl: string) {
    return await this.docClient.update({
      TableName: this.imagesTable,
      Key: {
        userId,
        imageId,
      },
      UpdateExpression: 'SET attachmentUrl = :attachmentUrl ',
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl
      }
    }).promise()
  }
}
