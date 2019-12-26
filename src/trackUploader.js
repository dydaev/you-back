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
    return 'downloaded ' + path;

  } catch (err) {
        console.log('File', treckId, 'is not found, downloading...')
        downloadFile(url + treckId)
        return 'downloading ' + path;
  }
}
