import { Router } from 'express'
import upload from './upload'

const routes = Router()

routes.get('/', (req, res) => res.status(200).json('API'))
routes.use('/s3', upload)

routes.use((err, req, res, next) => {
  if (err.name !== 'HttpError' || !err.errorCode) return next(err)
  res.status(err.errorCode).json({ message: err.message })
})

export default routes