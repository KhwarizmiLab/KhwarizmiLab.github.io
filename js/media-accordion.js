document.querySelectorAll(".media-section").forEach(function (section) {
  section.addEventListener("toggle", function () {
    if (section.open) {
      document.querySelectorAll(".media-section").forEach(function (other) {
        if (other !== section) other.open = false;
      });
    }
  });
});
