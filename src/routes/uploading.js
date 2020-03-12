const ytdl = require('ytdl-core');
const fs = require('fs');

import utils from '../utils';

export const uploading = async ctx => {
  if(ctx.params || ctx.params.id) {
    const trackId = ctx.params.id;
if (ytdl.validateID(trackId)) {
  const filePath = `files/${trackId}.webm`; // __dirname
  const fstat = await utils.stat(filePath);
  
  if (fstat.isFile()) {
        ctx.set('Content-disposition', 'attachment; filename=' + filePath);
        ctx.set('Content-type', 'audio/webm');
        
        ctx.body = fs.createReadStream(filePath);
        ctx.attachment(filePath)
      }
    }
  }
}