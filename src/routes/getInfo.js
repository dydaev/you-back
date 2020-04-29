const ytdl = require('ytdl-core');

import TracksModel from'../models/track';

import { addTrackToDb } from '../utils/addTrackToDb';
import { downloadFile } from '../utils/trackDownloader_v2';
import { checkFile, checkFileAndUpdateDb } from '../utils/checkFIle';

import { filesOptions } from '../../config';

export const getInfo = async (ctx, next) => {
  if(ctx.params || ctx.params.id) {
    const trackId = ctx.params.id
    const queryParams = ctx.req._parsedUrl.query ? ctx.req._parsedUrl.query.split('&') : [];

    const isForce = queryParams.includes('force')

    if(ytdl.validateID(trackId)) {
      const fileType = ctx.params.type ? ctx.params.type : 'highestaudio';

      let Track = await TracksModel.findOne({id: trackId}).exec();

      try {
        if (!Track) {
          Track = await addTrackToDb(trackId, fileType);
        } else {
  
          Track = {
            ...Track._doc,
            ...Track.pathToFile
              && !await checkFileAndUpdateDb(trackId, Track.pathToFile, TracksModel)
            ? {
              pathToFile : '',
              converted : 0,
              downloaded : 0,
            } 
            :{}
          }
        }
        
      } catch (err) {
        ctx.body=err.message;
      }

      try {
        if ( !Track.pathToFile || (Track.pathToFile && !await checkFile(Track.pathToFile)) )
        downloadFile(Track, fileType, isForce)
      } catch (err) {
        ctx.body=err.message;
      }

      if (Track && Track.id){
        console.log('Track from -', Track.id,'-< Downloaded:', Track.downloaded, ', converted:', Track.converted, '>');
      }
      
      ctx.body = JSON.stringify({
        ...Track,
        readiness: true ? (Track.converted / 2) + (Track.downloaded / 2) : Track.downloaded
      });
	} else {
      ctx.body = 'invalid track id'
    }

  } else {
    ctx.body = 'no track id'
  }
}