import { ImagesAccess } from './imagesAccess'
import { getUploadUrl } from './attachmentUtils';
import { ImageItem } from '../models/ImageItem'
import { CreateImageRequest } from '../requests/CreateImageRequest'
import { UpdateImageRequest } from '../requests/UpdateImageRequest'
// import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'

const imagesAccess: ImagesAccess = new ImagesAccess()

export const getImagesForUser = async (userId: string): Promise<ImageItem[]> => {
    return await imagesAccess.getAllByUserId(userId) as ImageItem[]
}

export const createImage = async (userId: string, newImage: CreateImageRequest) => {
    const imageId = uuid.v4()

    const imageItem: ImageItem = {
        ...newImage,
        userId,
        imageId,
    } as ImageItem
    
    return await imagesAccess.create(imageItem)
}

export const updateImage = async (updateImageRequest: UpdateImageRequest, userId: string, ImageId: string) => {
    return await imagesAccess.update(updateImageRequest, userId, ImageId)
}

export const deleteImage = async (userId: string, ImageId: string) => {
    return await imagesAccess.delete(userId, ImageId)
}

export const createAttachmentPresignedUrl = async (userId: string, ImageId: string) => {
    const uploadUrl = getUploadUrl(ImageId)

    await imagesAccess.updateAttachmentUrl(userId, ImageId, uploadUrl.split('?')[0])

    return uploadUrl
}
