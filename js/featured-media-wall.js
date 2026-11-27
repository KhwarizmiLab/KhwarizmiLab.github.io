(function () {
  var cloud = document.querySelector(".media-coverage .featured-media-grid");
  if (!cloud) return;

  var logos = cloud.querySelectorAll("img");

  function resizeLogos() {
    var cloudWidth = cloud.clientWidth;
    if (!cloudWidth) return;
    var maxWidth = Math.min(320, Math.max(140, cloudWidth - 16), cloudWidth);

    logos.forEach(function (logo) {
      if (!logo.naturalWidth || !logo.naturalHeight) return;

      var scale = Number.parseFloat(logo.closest(".featured-media-logo").dataset.logoScale) || 1;
      var ratio = logo.naturalWidth / logo.naturalHeight;
      var height = Math.min(64, Math.max(34, Math.sqrt(8500 / ratio) * scale));
      var width = height * ratio;
      if (width > maxWidth) {
        width = maxWidth;
        height = width / ratio;
      }

      logo.style.width = width.toFixed(1) + "px";
      logo.style.height = height.toFixed(1) + "px";
    });
  }

  logos.forEach(function (logo) {
    if (!logo.complete) logo.addEventListener("load", resizeLogos, { once: true });
  });

  resizeLogos();
  if (window.ResizeObserver) {
    new ResizeObserver(resizeLogos).observe(cloud);
  } else {
    window.addEventListener("resize", resizeLogos);
  }
})();
