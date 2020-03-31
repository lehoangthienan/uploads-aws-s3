import loGet from 'lodash/get'
import formidable from 'formidable'

import ServerError from '../utils/serverError'
import logger from '../utils/logger'
import {
    handleUploadFilesToS3,
    uploadFromUrlToS3,
    deleteFileFromGS3,
    uploadDirectoryToS3,
} from '../utils/aws_s3'

/*
  Create,      /
  Delete,     / An Le
  Directory  /
*/

export async function uploadImageToS3(req, res) {
    try {
        handleUploadFilesToS3(req)
        const files = []
        const form = new formidable.IncomingForm()
        form.multiples = true
        form
            .parse(req)
            .on('file', (field, file) => {
                const fileObj = {
                    data: {}
                }
                const filename = loGet(file, ['name'], '')
                const filenameTail = filename.match(/[^.]+$/i)[0]
                const extension = file.type.match(/[^/]+$/i)[0]
                const originalFilename = filename.replace(`.${filenameTail}`, '')
                const fileData = {
                    filename,
                    originalFilename,
                    localPath: loGet(file, ['path'], ''),
                    mimetype: loGet(file, ['type'], ''),
                    size: loGet(file, ['size'], null),
                    extension,
                }

                fileObj.field = field
                fileObj.data = fileData
                files.push(fileObj)
            })
            .on('end', async () => {
                if (files.length <= 0) throw new ServerError('No Files', 500)
                const urls = await Promise.all(files.map((file) => handleUploadFilesToS3(file.data)))

                res.status(200).json({
                    message: 'Success',
                    urls
                })
            })

    } catch (err) {
        logger.error(err)
        res.status(err.code || 500).json({
            message: err.message
        })
    }
}

export async function uploadImageUrlToS3(req, res) {
    try {
        const {
            url
        } = req.body

        const urls = await uploadFromUrlToS3(url)

        res.status(200).json({
            message: 'Success',
            urls,
        })

    } catch (err) {
        logger.error(err)
        res.status(err.code || 500).json({
            message: err.message
        })
    }
}

export async function deleteImageS3(req, res) {
    try {
        const {
            fileName
        } = req.params

        await deleteFileFromGS3(fileName)

        res.status(200).json({
            message: 'Success',
        })

    } catch (err) {
        logger.error(err)
        res.status(err.code || 500).json({
            message: err.message
        })
    }
}

export async function uploadDirectoryToAWSS3(req, res) {
    try {
        const {
            directoryPath
        } = req.body

        await uploadDirectoryToS3(directoryPath)

        res.status(200).json({
            message: 'Success',
        })

    } catch (err) {
        logger.error(err)
        res.status(err.code || 500).json({
            message: err.message
        })
    }
}

/*
  Create,      /
  Delete,     / AnLe
  Directory  /
*/