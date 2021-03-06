const Path = require('path')
const Async = require('async')
const sharp = require('sharp')
const debug = require('debug')('contribs:photo-manipulate')

// Resize multiple photos. Resized photos are written to the same dir as the
// originals, e.g. original.jpg, original@120x144.jpg, original@60x72.jpg
//
// srcs - array of image file paths
// width - desired width of the photos
// height - desired height of the photos
// opts.concurrency - number of images that should be processed concurrently
// opts.backgroundColor - color to place under each image
// cb(err, ['/path/to/photo.jpg'])
function resizePhotos (srcs, width, height, opts, cb) {
  debug(`Resizing ${srcs.length} photos`)

  Async.mapLimit(srcs, opts.concurrency || 5, (src, cb) => {
    if (!src) return cb() // src may be null if photo failed to download
    resizePhoto(src, width || 240, height || 288, {
      backgroundColor: opts.backgroundColor
    }, cb)
  }, cb)
}

module.exports.resizePhotos = resizePhotos

// Resize a single photo. Resized photos are written to the same dir as the
// originals, e.g. original.jpg, original@120x144.jpg, original@60x72.jpg
//
// src - image file path
// width - desired width of the photo
// height - desired height of the photos
// opts.backgroundColor - color to place under image
// cb(err, '/path/to/resized.jpg')
function resizePhoto (src, width, height, opts, cb) {
  debug(`Resizing ${src} to ${width}x${height}`)

  let image = sharp(src).resize(width, height).min().crop(sharp.strategy.center)

  if (opts.backgroundColor) {
    image = image.background(opts.backgroundColor).flatten()
  }

  const { dir, name, ext } = Path.parse(src)
  const dest = Path.join(dir, `${name}@${width}x${height}${ext}`)

  image.toFile(dest).then(() => cb(null, dest)).catch(cb)
}

module.exports.resizePhoto = resizePhoto
