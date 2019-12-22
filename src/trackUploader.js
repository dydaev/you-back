const fs = require('fs');

import { downloadFile } from './trackDownloader.js'

const format = 'webm'
const fileFolder = 'files'
const url = 'https://www.youtube.com/watch?v=';

export const getTrackPath = async treckId => {
  const path = `${fileFolder}/${treckId}.${format}`

  try {
    await fs.accessSync(path, fs.constants.F_OK);

    console.log('Track is found in path:', path)
    return path;

} catch (err) {
      console.log('File', treckId, 'is not found, downloading...')
      downloadFile(url + treckId)
      return path;
}

  // fs.access(path, fs.F_OK, isNotFound => {
  //   if (isNotFound) {
  //     console.log('File', treckId, 'is not found, downloading...')
  //     downloadFile(url + treckId)
  //     return path;
  //   }
  //
  //   console.log('Track is found in path:', path)
  //   return path;
  // })
}