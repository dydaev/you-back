const ytdl = require('ytdl-core');
const path = require('path');

import  { getTrackPath as trackPath }  from '../trackUploader.js'

export const getTrackPath = async (ctx, next) => {
  if(ctx.params || ctx.params.id) {
    const trackId = ctx.params.id

    if(ytdl.validateID(trackId)) {
      const treckId = ctx.params.id;
      console.log('Getting track:' , treckId)

      const filePath = await trackPath(treckId);
		console.log('path to track,', filePath)

		ctx.body = filePath
	} else {
      ctx.body = 'Invalid track id!'
    }

  } else {
    ctx.body = 'Is not id of track!'
  }
}