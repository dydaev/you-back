const ytdl = require('ytdl-core');

import TrackModel from'../models/track';

import {tempFilesFolder, filesOptions } from '../../config';

export const addTrackToDb = async ( videoId, fileType) => {
  try {

    const getInfo = videoId => {
      const tubeStream = ytdl(`https://youtube.com/watch?v=${videoId}`)

      return new Promise((resolve, reject) => {
        tubeStream.on('info', trackInfo => resolve(trackInfo));
        tubeStream.on("error", error => reject(error));
      })
    }

    const info = await getInfo(videoId);
  
    const thumbnails = info.player_response.videoDetails.thumbnail.thumbnails;

    const audioInfo = ytdl.chooseFormat(info.formats, { quality: fileType });

    const trackInfo = {
        ...info.media,
        id: videoId,
        image: thumbnails && thumbnails.length ? thumbnails[thumbnails.length - 1].url : undefined ,
        title: info.title,
        type: fileType,
        description: '', // info.description,
        length: Number.parseInt(info.length_seconds),
        audioBitrate: audioInfo.audioBitrate,
        audioChannels: audioInfo.audioChannels,
        audioSampleRate: audioInfo.audioSampleRate,
        contentLength: audioInfo.contentLength,
      }

    const newTrack = new TrackModel(trackInfo)

    const res = await newTrack.save();

    console.log('Added track to db:', videoId);
    return res._doc;
  } catch (e) {

    console.error('feiled geting track info:', e)

    throw('feiled geting track info:', e)
  }
}
