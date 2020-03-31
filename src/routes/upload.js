import { Router } from 'express'

import * as s3 from '../controllers/s3'

/*
  Create,      /
  Delete,     / ALE
  Directory  /
*/

const routes = new Router()

routes.post('/', s3.uploadImageToS3)
routes.post('/url', s3.uploadImageUrlToS3)
routes.post('/directory', s3.uploadDirectoryToAWSS3)
routes.delete('/:fileName', s3.deleteImageS3)

export default routes