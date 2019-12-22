const logger = require('koa-logger');
const serve = require('koa-static');
const koaBody = require('koa-body');
const Router = require('koa-router');
const send = require('koa-send');
var stream = require('koa-stream');
const Koa = require('koa');
const fs = require('fs');

const app = new Koa();
const router = new Router();

const os = require('os');
const path = require('path');
const ytdl = require('ytdl-core');

import  {getTrackPath}  from './trackUploader.js'

// log requests

app.use(logger());

app.use(koaBody({ multipart: true }));

// custom 404

app.use(async function(ctx, next) {
  await next();
  if (ctx.body || !ctx.idempotent) return;
  ctx.redirect('/404.html');
});

router.get('/getTrackPath/:id', async (ctx, next) => {
  if(ctx.params || ctx.params.id) {
    const trackId = ctx.params.id

    if(ytdl.validateID(trackId)) {
      const treckId = ctx.params.id;
      console.log('Getting track:' , treckId)

      const trackPath = await getTrackPath(treckId);
      console.log('path to track,', trackPath)

      ctx.body = trackPath
    } else {
      ctx.body = 'Invalid track id!'
    }

  } else {
    ctx.body = 'Is not id of track!'
  }
});

// serve files from ./public
app.use(serve(path.join(__dirname, '/files')));

app
  .use(router.routes())
  .use(router.allowedMethods());

// app.use( async (ctx) => {
app.use( async(ctx) => {

  if(/\/files\//.test(ctx.path)) {
    const filename = ctx.path.split('/')
    console.log('sending path', filename[2])
    // await stream.file(this, filename[2], {root: ''});
    await send(ctx, ctx.path, { root: '' });
  } else {
    console.log('get',ctx.path)
  }
})

app.listen(3000);
console.log('listening on port 3000');
