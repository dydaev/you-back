const fs = require('fs');
const ytdl = require('ytdl-core');
const readline = require('readline');

const format = 'webm';
const fileFolder = 'files';

export const downloadFile = (url) => {
  const path = `${fileFolder}/${ytdl.getVideoID(url)}.${format}`

  const video = ytdl(url, { filter: 'audioonly'})
  video.pipe(fs.createWriteStream(path));

  let starttime;
  video.once('response', () => {
    starttime = Date.now();
  });

  video.on('progress', (chunkLength, downloaded, total) => {
    const percent = downloaded / total;
    const downloadedMinutes = (Date.now() - starttime) / 1000 / 60;
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(`${(percent * 100).toFixed(2)}% downloaded `);
    process.stdout.write(`(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(total / 1024 / 1024).toFixed(2)}MB)\n`);
    process.stdout.write(`running for: ${downloadedMinutes.toFixed(2)}minutes`);
    process.stdout.write(`, estimated time left: ${(downloadedMinutes / percent - downloadedMinutes).toFixed(2)}minutes `);
    readline.moveCursor(process.stdout, 0, -1);
  });

  video.on('end', () => {
    process.stdout.write('\n\n');
  });
}
