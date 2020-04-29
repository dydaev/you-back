"use strict";
const ytdl = require('ytdl-core');
const path = require('path');
const fetch = require('node-fetch');

import  { getTrackPath as trackPath }  from '../trackUploader.js'

const getSubStr = (str, start, end) => {
    return str.substring(
    str.lastIndexOf(start) +  start.length, 
    str.lastIndexOf(end)
);
}

const getVarValueFromHtml = (str, variable) => {
    if(str && str.length && variable && variable.length){
        const indexOfStartVariableValue = str.indexOf(variable) + variable.length + 2;
        if (indexOfStartVariableValue >= 0) {
            const indefOfEndVariableValue = str.indexOf('"', indexOfStartVariableValue);

            return str.substring(indexOfStartVariableValue, indefOfEndVariableValue)
        }
    }
    return null;
}

export const getPlayList = async (ctx, next) => {
  if(ctx.params || ctx.params.id) {
      
    const playListId = ctx.params.id;
    console.log('reading play list', playListId)
//ctx.body = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Title of the document</title></head><body>'
//ctx.body =  ctx.body + 'Geting play list: ' + playListId;
      
    await fetch('https://www.youtube.com/playlist?list=' + playListId)
    .then(resp => resp.text())
    .then(async body => {
        const playHtml = getSubStr(body, '<tbody>', '</tbody>');
        
//        console.log(body)
        const startItemHtml = '<tr class="pl-video yt-uix-tile "';
        
        const playListItemsHtml = playHtml.split(startItemHtml);
        
        let response = [];
        
        await playListItemsHtml.forEach(async (pp, index) => {
            if(index > 0){
                response.push({
//		            length: "3:47",
                    artist: "",//getVarValueFromHtml(pp, '')
                    image:getVarValueFromHtml(pp, 'data-thumb'),
                    url: 'https://youtube.com/watch?v=' + getVarValueFromHtml(pp, 'data-video-id'),
                    title: getVarValueFromHtml(pp, 'data-title')
                })
            }  
        })
//        console.log(response)
        ctx.set('Content-Type', 'application/json');
        ctx.body = JSON.stringify(response);
    })
    .catch(err => console.error('Can`t get playlist from youtube:',err.message));
//      ctx.body =  ctx.body + '</body></html>'
      
  } else {
    ctx.body = 'Is not id of track!'
  }
}

/*
-----  " data-set-video-id="" data-video-id="QwtRXG1QpR4" data-title="Lewis Capaldi - Bruises (Official Video)"><td class="pl-video-handle "></td><td class="pl-video-index"></td><td class="pl-video-thumbnail"><span class="pl-video-thumb ux-thumb-wrap contains-addto"><a href="/watch?v=QwtRXG1QpR4&amp;list=PLyORnIW1xT6waC0PNjAMj33FdK2ngL_ik&amp;index=100&amp;t=0s" class="yt-uix-sessionlink" aria-hidden="true"  data-sessionlink="ei=6rNLXrfIG5eoyQW217qYAg&amp;feature=plpp_video&amp;ved=CGkQxjQYYiITCLflsJDq2ucCFRdUsgodtqsOIyj6LA" >  <span class="video-thumb  yt-thumb yt-thumb-72"
    >
    <span class="yt-thumb-default">
      <span class="yt-thumb-clip">
        
  <img onload=";window.__ytRIL &amp;&amp; __ytRIL(this)" src="/yts/img/pixel-vfl3z5WfW.gif" data-thumb="https://i.ytimg.com/vi/QwtRXG1QpR4/hqdefault.jpg?sqp=-oaymwEiCKgBEF5IWvKriqkDFQgBFQAAAAAYASUAAMhCPQCAokN4AQ==&amp;rs=AOn4CLAN_fmwNsD3fAv5XKUJdLPE0Omuuw" alt="" aria-hidden="true" width="72" data-ytimg="1" >

        <span class="vertical-align"></span>
      </span>
    </span>
  </span>
</a>  <span class="thumb-menu dark-overflow-action-menu video-actions">
  </span>


  <button class="yt-uix-button yt-uix-button-size-small yt-uix-button-default yt-uix-button-empty yt-uix-button-has-icon no-icon-markup addto-button video-actions spf-nolink hide-until-delayloaded addto-watch-later-button-sign-in yt-uix-tooltip" type="button" onclick=";return false;" role="button" title="Переглянути пізніше" data-button-menu-id="shared-addto-watch-later-login" data-video-ids="QwtRXG1QpR4"><span class="yt-uix-button-arrow yt-sprite"></span></button>
</span></td>  <td class="pl-video-title">
    <a class="pl-video-title-link yt-uix-tile-link yt-uix-sessionlink  spf-link " dir="ltr" href="/watch?v=QwtRXG1QpR4&amp;list=PLyORnIW1xT6waC0PNjAMj33FdK2ngL_ik&amp;index=100&amp;t=0s" data-sessionlink="ei=6rNLXrfIG5eoyQW217qYAg&amp;feature=plpp_video&amp;ved=CGkQxjQYYiITCLflsJDq2ucCFRdUsgodtqsOIyj6LA">
      Lewis Capaldi - Bruises (Official Video)
    </a>
      <div class="pl-video-owner">
автор: <a href="/channel/UCveFkLdSOUsGwMJEgedO9dQ" class=" yt-uix-sessionlink      spf-link " data-sessionlink="ei=6rNLXrfIG5eoyQW217qYAg&amp;ved=CGkQxjQYYiITCLflsJDq2ucCFRdUsgodtqsOIyj6LA" >Lewis Capaldi</a>
      </div>
      <div class="pl-video-bottom-standalone-badge">
        
      </div>
  </td>
<td class="pl-video-badges"></td><td class="pl-video-added-by"></td><td class="pl-video-time"><div class="more-menu-wrapper">  <div class="timestamp"><span aria-label="3 хвилини і 47 секунд">3:47</span></div>
<div class="pl-video-edit-options"></div></td></tr>
    


<tr
*/