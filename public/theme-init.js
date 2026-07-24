(function () {
  try {
    var savedTheme = localStorage.getItem("impakto-theme");
    var systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.dataset.theme = savedTheme === "light" || savedTheme === "dark"
      ? savedTheme
      : systemDark ? "dark" : "light";
  } catch (_) {
    document.documentElement.dataset.theme = "light";
  }
})();
