const media = document.querySelector('.showreel__media');

if (media) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reduceMotion) {
    const id = media.dataset.vimeoId;
    const iframe = document.createElement('iframe');
    iframe.src = `https://player.vimeo.com/video/${id}?background=1&autoplay=1&loop=1&muted=1&byline=0&title=0&portrait=0`;
    iframe.setAttribute('allow', 'autoplay; fullscreen');
    iframe.setAttribute('title', 'Showreel');
    iframe.setAttribute('frameborder', '0');
    media.appendChild(iframe);
  }
}
