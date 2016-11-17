import archiver from 'archiver'
import {createWriteStream as createTempStream} from 'temp'
import {createReadStream, createWriteStream} from './fs'
import {version} from '../../package.json'

const comment = (
  `Created with foxx-cli v${
    version
  } (https://foxx.arangodb.com)`
)

export default function (files, dest) {
  return new Promise((resolve, reject) => {
    let filename, filestream
    if (typeof dest === 'string') {
      filename = dest
      filestream = createWriteStream(dest)
    } else if (dest) {
      filestream = dest
      filename = dest.path
    } else {
      filestream = createTempStream({suffix: '.zip'})
      filename = filestream.path
    }
    filestream.on('close', () => resolve(filename))
    filestream.on('error', (e) => reject(e))
    const zipstream = archiver('zip', {comment})
    zipstream.on('error', (e) => reject(e))
    zipstream.pipe(filestream)
    for (const name of files) {
      zipstream.append(createReadStream(name), {name})
    }
    zipstream.finalize()
  })
}
