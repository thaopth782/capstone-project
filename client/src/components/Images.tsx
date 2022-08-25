import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createImage, deleteImage, getImages, patchImage } from '../api/images-api'
import Auth from '../auth/Auth'
import { Image as ImageType } from '../types/Image'

interface ImagesProps {
  auth: Auth
  history: History
}

interface ImagesState {
  images: ImageType[]
  newImageName: string
  loadingImages: boolean
}

export class Images extends React.PureComponent<ImagesProps, ImagesState> {
  state: ImagesState = {
    images: [],
    newImageName: '',
    loadingImages: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newImageName: event.target.value })
  }

  onEditButtonClick = (imageId: string) => {
    this.props.history.push(`/images/${imageId}/edit`)
  }

  onImageCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const newImage = await createImage(this.props.auth.getIdToken(), {
        name: this.state.newImageName
      })
      this.setState({
        images: [...this.state.images, newImage],
        newImageName: ''
      })
    } catch {
      alert('Image creation failed')
    }
  }

  onImageDelete = async (imageId: string) => {
    try {
      await deleteImage(this.props.auth.getIdToken(), imageId)
      this.setState({
        images: this.state.images.filter(image => image.imageId !== imageId)
      })
    } catch {
      alert('Image deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const images = await getImages(this.props.auth.getIdToken())
      this.setState({
        images,
        loadingImages: false
      })
    } catch (e) {
      if (e instanceof Error) {
        alert(`Failed to fetch images: ${e.message}`)
      }
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Images</Header>

        {this.renderCreateImageInput()}

        {this.renderImages()}
      </div>
    )
  }

  renderCreateImageInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New image',
              onClick: this.onImageCreate
            }}
            fluid
            actionPosition="left"
            placeholder="Image name..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderImages() {
    if (this.state.loadingImages) {
      return this.renderLoading()
    }

    return this.renderImagesList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading images
        </Loader>
      </Grid.Row>
    )
  }

  renderImagesList() {
    return (
      <Grid padded>
        {this.state.images.map((image, pos) => {
          return (
            <Grid.Row key={image.imageId}>
              <Grid.Column width={10} verticalAlign="middle">
                {image.name}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(image.imageId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onImageDelete(image.imageId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {image.attachmentUrl && (
                <Image src={image.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
