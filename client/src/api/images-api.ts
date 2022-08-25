import { apiEndpoint } from '../config'
import { Image } from '../types/Image';
import { CreateImageRequest } from '../types/CreateImageRequest';
import Axios from 'axios'
import { UpdateImageRequest } from '../types/UpdateImageRequest';

export async function getImages(idToken: string): Promise<Image[]> {
  console.log('Fetching images')

  const response = await Axios.get(`${apiEndpoint}/images`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Images:', response.data)
  return response.data.items
}

export async function createImage(
  idToken: string,
  newImage: CreateImageRequest
): Promise<Image> {
  const response = await Axios.post(`${apiEndpoint}/images`,  JSON.stringify(newImage), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchImage(
  idToken: string,
  imageId: string,
  updatedImage: UpdateImageRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/images/${imageId}`, JSON.stringify(updatedImage), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteImage(
  idToken: string,
  imageId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/images/${imageId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  imageId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/images/${imageId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
