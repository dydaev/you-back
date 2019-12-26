const logger = require('koa-logger');
const serve = require('koa-static');
const koaBody = require('koa-body');
const Router = require('koa-router');
const cors = require('@koa/cors');
const send = require('koa-send');
var stream = require('koa-stream');

const Koa = require('koa');
const fs = require('fs');

const app = new Koa();
const router = new Router();

const os = require('os');
const ytdl = require('ytdl-core');
const path = require('path');
const extname = path.extname;

import utils from './utils';

import { getTrackPath as routeGetTrackPath } from './routes/getTrackPath.js';
import { stream as routeStream} from './routes/stream.js';

import  { getTrackPath }  from './trackUploader.js'

// log requests
app.use(logger());
app.use(cors());
app.use(koaBody({ multipart: true }));

// custom 404
app.use(async function(ctx, next) {
  await next();
  if (ctx.body || !ctx.idempotent) return;
  ctx.redirect('/404.html');
});

//routes
router.get('/getTrackPath/:id', routeGetTrackPath)
router.get('/stream/:id', routeStream)

app
  .use(router.routes())
  .use(router.allowedMethods());

//downloading files
app.use( async (ctx) => {
  if(/\/files\//.test(ctx.path) && ctx.path.split('/').length === 3) {
    const fileUrlArray = ctx.path.split('/')
    const filePath = `files/${fileUrlArray[2]}`

    const fstat = await utils.stat(filePath);

    if(fstat.isFile(filePath)){
      console.log(ctx.request.ip, 'take file <-', filePath)
      await send(ctx, ctx.path, { root: '' });
    } else {
      console.log('can`t find file', filePath);
    }
  } else {
    console.log('bad url:',ctx.path)
  }
})


app.listen(3000);
console.log('listening on port 3000');
