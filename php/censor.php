<?php
header('Content-Type: application/json');

$videoUrl   = $_POST['videoUrl'] ?? '';
$frameMasks = $_POST['frameMasks'] ?? '{}';

// Basic checks
if (!$videoUrl) {
  echo json_encode(['success' => false, 'message' => 'No video URL provided']);
  exit;
}
$masks = json_decode($frameMasks, true);
if (!is_array($masks)) {
  echo json_encode(['success' => false, 'message' => 'Invalid mask data']);
  exit;
}

// 1) Download the original video from Google Drive
$tmpOriginal = tempnam(sys_get_temp_dir(), 'orig_') . '.mp4';
file_put_contents($tmpOriginal, file_get_contents($videoUrl));

// 2) Convert each base64 mask to an actual PNG file
$maskFolder = sys_get_temp_dir() . '/maskFrames_' . uniqid();
mkdir($maskFolder);

foreach ($masks as $frameIndex => $dataUrl) {
  // e.g. data:image/png;base64,iVBOR...
  $parts = explode(',', $dataUrl);
  if (count($parts) !== 2) continue; // not valid
  $base64Data = $parts[1];
  $decoded = base64_decode($base64Data);
  $maskFile = sprintf("%s/mask_%04d.png", $maskFolder, $frameIndex);
  file_put_contents($maskFile, $decoded);
}

/**
 * 3) Approach: 
 *    - Extract all frames from the original video using FFmpeg to a folder, e.g. frame_0001.png
 *    - For each frame_0001.png, if we have a corresponding mask_0001.png, 
 *      we blur the region or composite with that mask. 
 *    - Re-encode them to newBlurred.mp4
 *
 *    This is multiple FFmpeg steps and some loop in PHP. (Or a single advanced -filter_complex script.)
 */

$tmpFramesFolder = sys_get_temp_dir() . '/vidFrames_' . uniqid();
mkdir($tmpFramesFolder);

/** Extract frames at 30 fps (or detect actual fps):
 *  frame_%04d.png => frame_0001.png, frame_0002.png, ...
 */
$cmdExtract = "ffmpeg -i {$tmpOriginal} -vf fps=30 {$tmpFramesFolder}/frame_%04d.png 2>&1";
exec($cmdExtract, $out1, $ret1);
if ($ret1 !== 0) {
  echo json_encode(['success'=>false,'message'=>"Failed to extract frames: " . implode("\n",$out1)]);
  exit;
}

/** We now have a folder with frame_0001.png, frame_0002.png, etc. 
 *  For each frame, if there's a mask_%04d.png, we can do a partial blur or overlay.
 *  One approach: use a separate FFmpeg command to blend or boxblur each region. 
 *  A simpler approach: in PHP, we can do an image manipulation with Imagick or GD:
 *    - load frame_0001.png
 *    - load mask_0001.png 
 *    - wherever the mask is white, apply a blur or pixelation
 *    - save back to frame_0001.png
 *  Then after all frames are processed, we re-encode them. 
 *
 *  Below is a conceptual snippet for server-side "blur where mask is white" using GD or Imagick. 
 */

$frameFiles = glob($tmpFramesFolder.'/frame_*.png'); 
foreach ($frameFiles as $frameFile) {
  // figure out its index from the filename
  // e.g. frame_0001.png => index=1
  preg_match('/frame_(\d+)\.png$/', $frameFile, $matches);
  if (!isset($matches[1])) continue;
  $fIndex = intval($matches[1]);

  // see if we have mask_%04d.png
  $maskFile = sprintf("%s/mask_%04d.png", $maskFolder, $fIndex);
  if (!file_exists($maskFile)) {
    // no brush for this frame
    continue;
  }

  // (A) Load the frame and mask, (B) apply blur where mask is white
  $frameImg = imagecreatefrompng($frameFile);
  $maskImg  = imagecreatefrompng($maskFile);
  $width    = imagesx($frameImg);
  $height   = imagesy($frameImg);

  // Loop over pixels in $maskImg, if alpha > 0 or white, blur the corresponding region in $frameImg
  // Real "blur" in pure GD means implementing a blur algorithm or 
  // shelling out to "ffmpeg" or "imagemagick" again. Let's do a simple approach:
  // We might do a "pixelate" approach for demonstration. 
  for ($y=0; $y<$height; $y+=5) {
    for ($x=0; $x<$width; $x+=5) {
      // sample a 5x5 region in mask
      $maskPixel = imagecolorat($maskImg, $x, $y);
      // if alpha not 0 or the color is near white => apply blocky pixelation
      $alpha = ($maskPixel & 0x7F000000) >> 24; 
      if ($alpha < 127) { // means pixel is somewhat opaque
        // Now "pixelate" the region in $frameImg from (x, y) to (x+5, y+5)
        // For demonstration:
        imagefilter($frameImg, IMG_FILTER_PIXELATE, 5, true, $x, $y, 5, 5);
      }
    }
  }

  // Save the updated frame
  imagepng($frameImg, $frameFile);
  imagedestroy($frameImg);
  imagedestroy($maskImg);
}

/** 
 * 4) Re-encode the frames back into a video 
 */
$tmpBlurred = tempnam(sys_get_temp_dir(), 'blur_') . '.mp4';
$cmdEncode = "ffmpeg -framerate 30 -i {$tmpFramesFolder}/frame_%04d.png -c:v libx264 -pix_fmt yuv420p {$tmpBlurred} 2>&1";
exec($cmdEncode, $out2, $ret2);
if ($ret2 !== 0) {
  echo json_encode(['success'=>false,'message'=>"Failed to encode blurred video: " . implode("\n",$out2)]);
  exit;
}

// 5) Upload $tmpBlurred to Google Drive (like in earlier examples), then respond with success
// ...
// (omitted for brevity)

echo json_encode(['success'=>true, 'message'=>'Blur completed!', 'fileId'=>'EXAMPLE_NEW_ID']);
