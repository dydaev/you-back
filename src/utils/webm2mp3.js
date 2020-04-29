var fs = require('fs');
import ffmpeg from 'fluent-ffmpeg';
const readline = require('readline');

import { filesOptions } from '../../config';


import TrackModel from'../models/track';

export const converter =  (track, typeOfTrack) => {    
    if(typeof track !== 'object') throw Error('No track object for converting!');

    return new Promise((resolve, reject) => {
        const trackId = track.id;
        const fileOutputPath = `${filesOptions[typeOfTrack].filePath}/${trackId}_${typeOfTrack}.${filesOptions[typeOfTrack].format}`
        const pathToTempFile = track.pathToFile

        if (filesOptions[typeOfTrack].isNeedConvertation && fileOutputPath && pathToTempFile) {
            console.log('Start converting file', pathToTempFile, 'to', fileOutputPath);
            
            ffmpeg(pathToTempFile)
            .audioCodec('libmp3lame')
            .audioFrequency(track.audioSampleRate)
            .audioBitrate(track.audioBitrate)
            .audioChannels(track.audioChannels)
            .output(fileOutputPath)
            .on('error', function(err) {
                console.log('Convert track error occurred: ' + err.message);
                reject('Convert track error occurred: ' + err.message)
            })
            .on('progress', function(data) {
                readline.cursorTo(process.stdout, 0);
                process.stdout.write(`Convert ${trackId}: ${data.percent.toFixed()}%`);
                readline.moveCursor(process.stdout, 0, 0);
            })
            .on('end', function() {
                const updatedTrack = {
                    isConverted: true,
                    pathToFile: fileOutputPath,
                }

                TrackModel.findOneAndUpdate(
                    trackId,
                    updatedTrack,
                    err => {if(err) console.log('Can`t update in db, convert of track:', trackId)}
                )
                console.log('\nProcessing', trackId ,'finished!');

                fs.unlink(pathToTempFile, () => {
                    console.log('Deleted temp file', pathToTempFile);
                })

                resolve({
                    ...track,
                    ...updatedTrack
                })
            })
            .run();
        }
    })
}
