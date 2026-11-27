(function () {
  var sections = document.querySelectorAll(".media-section");
  var activeSection = null;

  sections.forEach(function (section) {
    if (section.open) activeSection = section;
  });

  sections.forEach(function (section) {
    section.addEventListener("toggle", function () {
      if (section.open) {
        sections.forEach(function (other) {
          if (other !== section) other.open = false;
        });
      }

      // Native name grouping may dispatch the closing toggle before the opening one.
      var openedSection = null;
      sections.forEach(function (other) {
        if (other.open) openedSection = other;
      });

      var switchingSections = activeSection && openedSection && activeSection !== openedSection;
      activeSection = openedSection;
      if (!switchingSections) return;

      // Let the collapsed content and browser scroll anchoring settle before measuring.
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          if (!openedSection.open || activeSection !== openedSection) return;
          var summary = openedSection.querySelector("summary");
          var navbar = document.querySelector(".navbar-fixed-top");
          var offset = navbar ? Math.max(0, navbar.getBoundingClientRect().bottom) : 0;
          window.scrollTo({
            top: window.scrollY + summary.getBoundingClientRect().top - offset - 12,
            behavior: "instant"
          });
        });
      });
    });
  });
})();
