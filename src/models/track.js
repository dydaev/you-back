var mongoose = require('../utils/mongoose');

const trackSchema = new mongoose.Schema({
    id: {type: String, required: true},
    type: String,
    song: String,
    album: String,
    artist: String,
    length: Number,
    image: String,
    title: String,
    audioBitrate: Number,
    audioChannels: Number,
    audioSampleRate: Number,
    contentLength: Number,
    description: String,
    removedOnTube: Date,
    pathToFile: {type: String, default: ''},
    downloaded: { type: Number, default: 0 },
    converted: { type: Number, default: 0 },
    createDate: { type: Date, default: Date.now },
    lastUsedDate: { type: Date, default: Date.now }
  });

export default mongoose.model('Track', trackSchema);