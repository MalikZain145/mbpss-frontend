import { useEffect } from 'react';

export default function CustomScrollbar() {
  useEffect(() => {
    // Inject a style tag that aggressively hides native scrollbar
    // and replaces with a custom overlay scrollbar
    const styleEl = document.createElement('style');
    styleEl.id = 'custom-scrollbar-style';
    styleEl.textContent = `
      /* Hide native scrollbar completely */
      html {
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
        overflow-y: scroll;
      }
      html::-webkit-scrollbar {
        width: 0px !important;
        display: none !important;
      }
      body::-webkit-scrollbar { display: none !important; }
      *::-webkit-scrollbar-track { display: none !important; }
      *::-webkit-scrollbar-button { display: none !important; }
    `;
    document.head.appendChild(styleEl);

    // Create custom scrollbar thumb
    const thumb = document.createElement('div');
    thumb.id = 'custom-scroll-thumb';
    Object.assign(thumb.style, {
      position:     'fixed',
      right:        '3px',
      top:          '0',
      width:        '4px',
      borderRadius: '20px',
      background:   '#c9a84c',
      zIndex:       '99999',
      pointerEvents:'none',
      transition:   'opacity 0.3s ease',
      opacity:      '0',
    });
    document.body.appendChild(thumb);

    let hideTimer = null;

    const updateThumb = () => {
      const scrollTop    = window.scrollY;
      const docHeight    = document.documentElement.scrollHeight;
      const winHeight    = window.innerHeight;
      const scrollable   = docHeight - winHeight;
      if (scrollable <= 0) { thumb.style.opacity = '0'; return; }

      const thumbHeight  = Math.max(40, (winHeight / docHeight) * winHeight);
      const thumbTop     = (scrollTop / scrollable) * (winHeight - thumbHeight);

      thumb.style.height  = thumbHeight + 'px';
      thumb.style.top     = thumbTop + 'px';
      thumb.style.opacity = '1';

      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => { thumb.style.opacity = '0'; }, 1200);
    };

    window.addEventListener('scroll', updateThumb, { passive: true });
    window.addEventListener('resize', updateThumb, { passive: true });
    updateThumb();

    return () => {
      window.removeEventListener('scroll', updateThumb);
      window.removeEventListener('resize', updateThumb);
      clearTimeout(hideTimer);
      document.getElementById('custom-scrollbar-style')?.remove();
      document.getElementById('custom-scroll-thumb')?.remove();
    };
  }, []);

  return null;
}