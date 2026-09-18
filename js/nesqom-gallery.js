(function () {
  var dialog = document.getElementById('nesqom-lightbox');
  if (!dialog || typeof dialog.showModal !== 'function') return;

  var links = Array.prototype.slice.call(document.querySelectorAll('[data-nesqom-photo]'));
  var image = dialog.querySelector('img');
  var caption = dialog.querySelector('figcaption');
  var current = 0;
  var opener = null;

  function showPhoto(index) {
    current = (index + links.length) % links.length;
    var link = links[current];
    var thumbnail = link.querySelector('img');
    image.src = link.href;
    image.alt = thumbnail.alt;
    caption.textContent = link.parentNode.querySelector('figcaption').textContent;
  }

  links.forEach(function (link, index) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      opener = link;
      showPhoto(index);
      dialog.showModal();
    });
  });

  dialog.querySelector('.nesqom-lightbox-prev').addEventListener('click', function () {
    showPhoto(current - 1);
  });
  dialog.querySelector('.nesqom-lightbox-next').addEventListener('click', function () {
    showPhoto(current + 1);
  });
  dialog.querySelector('.nesqom-lightbox-close').addEventListener('click', function () {
    dialog.close();
  });
  dialog.addEventListener('click', function (event) {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showPhoto(current - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      showPhoto(current + 1);
    }
  });
  dialog.addEventListener('close', function () {
    image.removeAttribute('src');
    if (opener) opener.focus();
  });
}());
