const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).send('Only GET allowed');

  const { url, format = 'mp3', bitrate = '128k', samplerate = '44100' } = req.query;

  if (!url || !ytdl.validateURL(url)) return res.status(400).send('Invalid YouTube URL');

  res.setHeader('Content-Disposition', `attachment; filename="audio.${format}"`);
  res.setHeader('Content-Type', `audio/${format}`);

  try {
    const stream = ytdl(url, { quality: 'highestaudio' });

    let command = ffmpeg(stream)
      .audioCodec('libmp3lame')
      .audioBitrate(bitrate)
      .format(format);

    // WAV and FLAC adjustments
    if (format === 'wav') command = ffmpeg(stream).audioCodec('pcm_s16le').format('wav');
    if (format === 'flac') command = ffmpeg(stream).audioCodec('flac').format('flac');
    if (format === 'mp4') command = ffmpeg(stream).format('mp4');

    command.outputOptions(`-ar ${samplerate}`);
    command.pipe(res, { end: true });
  } catch (err) {
    console.error(err);
    res.status(500).send('Conversion failed');
  }
}
