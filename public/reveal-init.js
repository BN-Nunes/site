(function () {
  try {
    if ("IntersectionObserver" in window) {
      document.documentElement.classList.add("reveal-ready");
    }
  } catch {}
})();
