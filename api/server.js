const express = require('express');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve index.html
app.use(express.static(path.join(__dirname)));

// Download endpoint
app.get('/api/download', async (req, res) => {
  const { url, format = 'mp3', bitrate = '128k', samplerate = '44100' } = req.query;

  if (!url || !ytdl.validateURL(url)) {
    return res.status(400).send('Invalid YouTube URL.');
  }

  res.setHeader('Content-Disposition', `attachment; filename="audio.${format}"`);
  res.setHeader('Content-Type', `audio/${format}`);

  try {
    const stream = ytdl(url, { quality: 'highestaudio' });

    let command = ffmpeg(stream)
      .audioCodec('libmp3lame')
      .audioBitrate(bitrate)
      .format(format);

    if (format === 'wav') command = ffmpeg(stream).audioCodec('pcm_s16le').format('wav');
    if (format === 'flac') command = ffmpeg(stream).audioCodec('flac').format('flac');
    if (format === 'mp4') command =
