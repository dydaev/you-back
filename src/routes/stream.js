const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');
const extname = path.extname;

import utils from '../utils';

export const stream = async ctx => {
  if(ctx.params || ctx.params.id) {
    const trackId = ctx.params.id;

    if (ytdl.validateID(trackId)) {
      const filePath = `files/${trackId}.webm`; // __dirname
      const fstat = await utils.stat(filePath);

      if (fstat.isFile()) {
        // ctx.set('Content-disposition', 'attachment; filename=' + filePath);
        ctx.type = extname(filePath);
        ctx.body = fs.createReadStream(filePath);
      }
    }
  }
}
