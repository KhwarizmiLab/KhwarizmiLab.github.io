(function ($) {
  var sections = $('.navbar-section');
  var hoverPointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  function clearHover(section) {
    section.removeClass('navbar-hover');
    if (!section.hasClass('open')) {
      section.children('.navbar-section-toggle').attr('aria-expanded', 'false');
    }
  }

  sections.on('mouseenter', function () {
    var section = $(this);
    if (hoverPointer.matches && !section.hasClass('open')) {
      section.addClass('navbar-hover');
      section.children('.navbar-section-toggle').attr('aria-expanded', 'true');
    }
  }).on('mouseleave', function () {
    clearHover($(this));
  }).on('shown.bs.dropdown', function () {
    $(this).removeClass('navbar-hover');
  }).on('hidden.bs.dropdown', function () {
    clearHover($(this));
  }).on('keydown', function (event) {
    var section = $(this);
    if (event.which === 27 && section.hasClass('navbar-hover')) {
      event.preventDefault();
      event.stopPropagation();
      clearHover(section);
      section.children('.navbar-section-toggle').trigger('focus');
    }
  });

  $(document).on('keydown', function (event) {
    if (event.which === 27) {
      sections.filter('.navbar-hover').each(function () {
        clearHover($(this));
      });
    }
  });
})(jQuery);
