/**
 * Converts standard YouTube and Vimeo URLs into embeddable URLs.
 */
export function getEmbedUrl(url: any): string {
  if (!url || typeof url !== 'string') return '';

  // YouTube
  // Patterns: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID, youtube.com/live/ID, youtube.com/shorts/ID
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|live|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch && youtubeMatch[1]) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  // Vimeo
  // Patterns: vimeo.com/ID, vimeo.com/channels/*/ID, etc.
  const vimeoRegex = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  // Google Drive
  // Patterns: drive.google.com/file/d/ID/view, drive.google.com/open?id=ID
  const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=))([a-zA-Z0-9_-]+)/;
  const driveMatch = url.match(driveRegex);
  if (driveMatch && driveMatch[1]) {
    return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  }

  return url;
}
