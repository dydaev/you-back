import fs from 'fs';
import ytdl from 'ytdl-core';
import readline from'readline';
import ffmpeg from 'fluent-ffmpeg';

import { checkFile } from '../utils/checkFIle';

import TrackModel from'../models/track';

import {filesOptions, msOfUpdatingDb } from '../../config';
import { createContext } from 'vm';

export const downloadFile = async (Track, typeOfTrack, force = false) => {
  const videoId = Track.id;

  const isNeedConvert = filesOptions[typeOfTrack].isNeedConvertation;
  const filePath = `${filesOptions[typeOfTrack].filePath}/${videoId}_${typeOfTrack}.${filesOptions[typeOfTrack].format}`
  const tempFilePath= `${filesOptions[typeOfTrack].tempFileFolder}/${videoId}_${typeOfTrack}.${filesOptions[typeOfTrack].tempFormat}`

  let updatedTrack = {...Track};
 
  if (force
    || !await checkFile(filePath)
    // || (!isNeedConvert && !fs.statSync(filePath) )//Track.contentLength !== fs.statSync(filePath).size)
  ) {

    const isDownloading = Track.downloaded > 0 && Track.downloaded < 100

    if ( isNeedConvert ) {
      const audioFrequency = Track.audioSampleRate
      const audioBitrate = Track.audioBitrate
      const audioChannels = Track.audioChannels
      const codec = filesOptions[typeOfTrack].codec;
      
      if ((force && false)
        || (
          await checkFile(tempFilePath) 
          && !await checkFile(filePath)
          && Track.contentLength === fs.statSync(tempFilePath).size
        )
      ) { //&& Track.contentLength === fs.statSync(tempFilePath).size) ) { // !fs.statSync(tempFilePath)) ){
        // Track.contentLength === fs.statSync(tempFilePath).size ) {
        
        // const isConverting = Track.converted > 0 && Track.converted < 100
        console.log('File', tempFilePath,'is found, start converting');

        if (/* !isConverting && */ await convertTrack(
          tempFilePath,
          filePath,
          videoId,
          typeOfTrack,
          codec,
          audioFrequency,
          audioBitrate,
          audioChannels
          )) {
            updatedTrack = {
              ...updatedTrack,
              pathToFile: filePath,
              contentLength: fs.statSync(filePath).size
            }
          } else {
            console.log('Aborted converting', videoId + ', process already begun or error processing');
          }
      } else if (force || !await checkFile(tempFilePath)) {

        console.log('Start downloading for convertation', tempFilePath);
        if (await downloadTrack(videoId, typeOfTrack, tempFilePath) ) {

          console.log('File', tempFilePath,'downloaded, start converting');

          if (await convertTrack(
            tempFilePath,
            filePath,
            videoId,
            typeOfTrack,
            codec,
            audioFrequency,
            audioBitrate,
            audioChannels
          )) {
            updatedTrack = {
              ...updatedTrack,
              pathToFile: filePath,
              downloaded: 100,
              converted: 100,
              contentLength: fs.statSync(filePath).size
            }
          }
        } else {
          console.log('Aborted downloading', videoId + ', process already begun');
        }
      }
    } else {

      if ((force && await downloadTrack(videoId, typeOfTrack, filePath))
      || (!isDownloading && await downloadTrack(videoId, typeOfTrack, filePath)) ) {

        console.log('Start downloading', filePath);
        
        updatedTrack = {
          ...updatedTrack,
          pathToFile: filePath,
        }
      } else {
        console.log('Aborted downloading', videoId + ', process already begun');
      }
    }

  } else if ( filePath !== Track.pathToFile ) {

    console.log('File', filePath,'size', fs.statSync(filePath).size,'is found, saving info');

    updatedTrack = {
      ...updatedTrack,
      downloaded: 100,
      converted: isNeedConvert ? 100 : 0,
      pathToFile: filePath,
    }
  }

  if ( JSON.stringify(Track) !== JSON.stringify(updatedTrack) ) {
    
    delete updatedTrack._id;
    
    TrackModel.findOneAndUpdate(
      {id: videoId, type: typeOfTrack },
      updatedTrack,
      err => { if(err) console.log('Can`t save downloading(convertin) data for:', videoId,', ', '(' + err.message + ')') }
    )
    return updatedTrack
  }

  return Track
}





//============================================================================================= DOWNLOAD

const downloadTrack = (videoId, typeOfTrack, pathToFile) => {
  try {
    
    const videoStream = ytdl(`https://youtube.com/watch?v=${videoId}`, {
      filter: filesOptions[typeOfTrack].filter,
      quality: filesOptions[typeOfTrack].quality
    })
    
    videoStream.pipe(fs.createWriteStream(pathToFile));
  

    return new Promise((resolve, reject) => {
      let savePercent;
      let starttime;
      
      videoStream.once('response', () => {
        starttime = Date.now();
      });

      videoStream.on('progress', (chunkLength, downloaded, total) => {
        const percent = (downloaded / total) * 100;

        if ( percent.toFixed() !== savePercent ) {
          savePercent = percent.toFixed()

          readline.cursorTo(process.stdout, 0);
          process.stdout.write(`Download ${videoId}: ${percent.toFixed()}%`);
          readline.moveCursor(process.stdout, 0, 0);

          if( (Date.now() - starttime) > msOfUpdatingDb ) {
            starttime = Date.now();

            TrackModel.findOneAndUpdate(
              { id: videoId, type: typeOfTrack },
              {
                downloaded: percent.toFixed()
              },
              err => { if(err) console.log('Can`t update download percent for track:', videoId) }
            )
          }
        }
      });

      videoStream.on('end', async () => {
        TrackModel.findOneAndUpdate(
          { id: videoId, type: typeOfTrack },
          {
            downloaded: 100
          },
          err => { if(err) console.log('Can`t update download percent for track:', videoId) }
        )
        resolve(true)
      });

      videoStream.on("error", error => {
        TrackModel.findOneAndUpdate(videoId, {
            pathToFile: '',
            downloaded: 0
          }, err => {if(err) console.log('Can`t update in db,', videoId,'for track:', err)}
        )
        console.log('Can`t dovnloading track' ,videoId,':', error.message);
        
        return reject(error)
      });
    })
  } catch (er) {
    console.warn('Can`t get file from youtube.', er.message)
    throw('Can`t get file from youtube: ' +  er.message);
  }
}





//============================================================================================= CONVERTER

const convertTrack =  (
  pathToInputFile,
  pathToOutputFile,
  trackId,
  typeOfTrack,
  audioCodec,
  audioFrequency,
  audioBitrate,
  audioChannels
  ) => {

  return new Promise((resolve, reject) => {
      if (filesOptions[typeOfTrack].isNeedConvertation && pathToInputFile && pathToOutputFile) {
          console.log('Start converting file', pathToInputFile, 'to', pathToOutputFile);
          let starttime;
          let savePercent;

          ffmpeg(pathToInputFile)
          .audioCodec(audioCodec)
          .audioFrequency(audioFrequency)
          .audioBitrate(audioBitrate)
          .audioChannels(audioChannels)
          .output(pathToOutputFile)
          .on('error', function(err) {
              console.log('Convert track error occurred: ' + err.message);
              reject('Convert track error occurred: ' + err.message)
          })
          .on('start', () => {
            starttime = Date.now();
          })
          .on('progress', data => {
            if ( data.percent.toFixed() !== savePercent ) {
              savePercent = data.percent.toFixed()

              readline.cursorTo(process.stdout, 0);
              process.stdout.write(`Convert ${trackId}: ${data.percent.toFixed()}%`);
              readline.moveCursor(process.stdout, 0, 0);

              if( (Date.now() - starttime) > msOfUpdatingDb ) {
                starttime = Date.now();

                TrackModel.findOneAndUpdate(
                  { id: trackId, type: typeOfTrack },
                  {
                    converted: data.percent.toFixed()
                  },
                  err => { if(err) console.log('Can`t update convert percent for track:', videoId) }
                )
              }
            }
          })
          .on('end', () => {
            TrackModel.findOneAndUpdate(
              { id: trackId, type: typeOfTrack },
              {
                converted: 100,
                pathToFile: pathToOutputFile,
              },
              err => { if(err) console.log('Can`t update in db, convert of track:', trackId) }
            )
            console.log('\nConverting', trackId ,'complited!');

            fs.unlink(pathToInputFile, () => {
              console.log('Deleted temp file', pathToInputFile);
            })

            resolve(true)
          })
          .run();
      }
  })
}
