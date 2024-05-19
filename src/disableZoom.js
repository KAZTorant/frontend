// src/disableZoom.js

function preventZoom(event) {
    if (event.touches.length > 1) {
      event.preventDefault();
    }
  }
  
  document.addEventListener('touchstart', preventZoom, { passive: false });
  document.addEventListener('touchmove', preventZoom, { passive: false });
  document.addEventListener('touchend', preventZoom, { passive: false });
  