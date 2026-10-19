/* ============================================================
   OPTIONAL: Thanksgiving Animated Leaves FX
   ============================================================ */
export function initThanksgivingLeaves() {
  if (typeof document === 'undefined') return;

  const leavesContainerId = 'thanksgiving-leaves-container';
  let container = document.getElementById(leavesContainerId);

  // If theme is active and container doesn't exist, create it
  if (document.body && document.body.classList.contains('thanksgiving-theme')) {
    if (!container) {
      container = document.createElement('div');
      container.id = leavesContainerId;
      container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;';
      document.body.appendChild(container);

      const leafIcons = ['🍂', '🍁', '🌰'];
      for (let i = 0; i < 12; i++) {
        const leaf = document.createElement('div');
        leaf.innerText = leafIcons[Math.floor(Math.random() * leafIcons.length)];
        leaf.style.cssText = `
          position: absolute;
          top: -10%;
          left: ${Math.random() * 100}vw;
          font-size: ${14 + Math.random() * 12}px;
          opacity: ${0.3 + Math.random() * 0.5};
          animation: fallAndSway ${6 + Math.random() * 6}s linear infinite;
          animation-delay: ${Math.random() * 5}s;
        `;
        container.appendChild(leaf);
      }

      // Add keyframes for falling animation safely
      if (!document.getElementById('thanksgiving-keyframes')) {
        const style = document.createElement('style');
        style.id = 'thanksgiving-keyframes';
        style.innerHTML = `
          @keyframes fallAndSway {
            0% { transform: translateY(0vh) rotate(0deg) translateX(0px); }
            50% { transform: translateY(50vh) rotate(180deg) translateX(25px); }
            100% { transform: translateY(115vh) rotate(360deg) translateX(-25px); }
          }
        `;
        document.head.appendChild(style);
      }
    }
  } else if (container) {
    // Clean up if theme is disabled
    container.remove();
  }
}

// Observe class changes on <body> to toggle leaf animation automatically
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (typeof MutationObserver !== 'undefined' && document.body) {
    const observer = new MutationObserver(initThanksgivingLeaves);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  // Trigger on load in case theme is active by default
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThanksgivingLeaves);
  } else {
    initThanksgivingLeaves();
  }
}
