const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');
const extname = path.extname;

import utils from '../utils';

export const files = async ctx => {
  if(ctx.params && ctx.params.file && ctx.params.folder) {
    const filename = ctx.params.file;
    const foldername = ctx.params.folder;
  

    if ( true/* ytdl.validateID(trackId) */) {
      const filePath = `files/${foldername}/${filename}`; // __dirname
      const fstat = await utils.stat(filePath);

      if (fstat.isFile()) {
        // ctx.set('Content-disposition', 'attachment; filename=' + filePath);
        ctx.type = extname(filePath);
        ctx.body = fs.createReadStream(filePath);
      }
    }
  }
}