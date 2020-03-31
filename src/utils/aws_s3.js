import AWS from 'aws-sdk'
import axios from 'axios'
import loGet from 'lodash/get'
import path from 'path'
import sharp from 'sharp'
import fs from 'fs'

import {
    IMAGE_SIZE,
} from './constants'
import {
    changeAlias,
} from './commons'
import configs from '../configs'

const s3 = new AWS.S3({
    accessKeyId: configs.ACCESS_KEY_ID,
    secretAccessKey: configs.SECRET_ACCESS_KEY,
})

/*
  Create,      /
  Delete,     / A n L e
  Directory  /
*/

export const handleUploadFilesToS3 = data =>
    new Promise((resolve, reject) => {
        _handleUploadFile(data)
            .then(urls => {
                resolve(urls)
            })
            .catch(error => reject(error))
    })

const _handleUploadFile = data => {
    return Promise.all(IMAGE_SIZE.map(size => {
        return new Promise((resolve, reject) => {
            const s3Name = `${Date.now()}-${data.originalFilename}@${size.type}.${data.extension}`
            sharp(data.localPath)
                .rotate()
                .resize(size.value)
                .toBuffer()
                .then(file => {
                    s3.putObject({
                            Bucket: configs.BUCKET,
                            Body: file,
                            Key: `${s3Name}`,
                            ACL: 'public-read',
                            ContentType: data.mimetype,
                        })
                        .promise()
                        .then(() => {
                            resolve(`${configs.S3_DOMAIN}${s3Name}`)
                        })
                        .catch(err => {
                            reject(err)
                        })
                })

        })
    }))
}

export const uploadFromUrlToS3 = (url, filename = 'avatar') =>
    new Promise(async (resolve, reject) => {
        try {
            const response = await axios.get(url, {
                responseType: 'arraybuffer'
            })
            const buffer = loGet(response, ['data'], [])
            const contentType = loGet(response, ['headers', 'content-type'], '')
            const handledFilename = changeAlias(filename.trim().replace(/ /g, '-'))
            const data = {
                localPath: buffer,
                mimetype: contentType,
                originalFilename: handledFilename,
                extension: 'jpeg',
            }
            const urls = await _handleUploadFile(data)
            resolve(urls)
        } catch (error) {
            reject(error)
        }
    })

export const deleteFileFromGS3 = key =>
    new Promise((resolve, reject) => {
        s3.deleteObject({
                Bucket: configs.BUCKET,
                Key: `${key}`,
            })
            .promise()
            .then(res => {
                resolve(res)
            })
            .catch(err => {
                reject(err)
            })
    })

export const uploadDirectoryToS3 = async (directoryPath) => {
    const pathDirName = path.dirname(directoryPath);
    await getFiles(directoryPath, pathDirName);
}

const getFiles = async (directory, pathDirName) => {
    let dirCtr = 1;
    let itemCtr = 0;
    const fileList = []

    const items = await fs.readdirSync(directory)
    dirCtr--;
    itemCtr += items.length;

    for (let i = 0; i < items.length; i++) {
        const fullPath = path.join(directory, items[i]);
        const stat = await fs.statSync(fullPath)
        itemCtr--;
        if (stat.isFile()) {
            fileList.push(fullPath);
        } else if (stat.isDirectory()) {
            dirCtr++;
            getFiles(fullPath, pathDirName);
        }
    }
    await onCompleteUploadDirectoryToS3(fileList, pathDirName);
}

const onCompleteUploadDirectoryToS3 = async (fileList, pathDirName) => {
    await Promise.all(
        fileList.map(filePath => {
            return s3.putObject({
                    Bucket: configs.BUCKET,
                    Body: fs.readFileSync(filePath),
                    Key: `${filePath}`,
                    ACL: 'public-read',
                })
                .promise()
        })
    );
}

/*
  Create,      /
  Delete,     / A n L e
  Directory  /
*/