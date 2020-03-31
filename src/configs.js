import dotenv from 'dotenv'

dotenv.config()

export default {
  PORT: process.env.BACKEND_PORT,
  ACCESS_KEY_ID: process.env.ACCESS_KEY_ID,
  SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY,
  BUCKET: process.env.BUCKET,
  S3_DOMAIN: process.env.S3_DOMAIN,
}