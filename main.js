// Project photo carousels: arrows (on hover), dots, swipe and arrow keys.
// Without JS each card simply shows its first photo.
(function () {
  var CHEVRON_LEFT = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M15 6l-6 6 6 6"></path></svg>';
  var CHEVRON_RIGHT = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M9 6l6 6-6 6"></path></svg>';
  var SWIPE_MIN = 40;

  function button(className, label, html) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = className;
    b.setAttribute('aria-label', label);
    if (html) b.innerHTML = html;
    return b;
  }

  function setup(car) {
    var imgs = car.querySelectorAll('img');
    var n = imgs.length;
    if (n < 2) return;

    var index = 0;
    var dotsWrap = document.createElement('div');
    dotsWrap.className = 'car-dots';
    var dots = [];

    // Fetch the neighbouring photos once someone shows interest in this carousel.
    function warm() {
      [imgs[(index + 1) % n], imgs[(index - 1 + n) % n]].forEach(function (img) {
        if (img.loading === 'lazy') img.loading = 'eager';
      });
    }

    function show(k) {
      index = (k + n) % n;
      for (var i = 0; i < n; i++) {
        imgs[i].classList.toggle('is-active', i === index);
        dots[i].setAttribute('aria-current', i === index ? 'true' : 'false');
      }
      warm();
    }

    function render() {
      for (var i = 0; i < n; i++) dots[i].setAttribute('aria-current', i === index ? 'true' : 'false');
    }

    for (var i = 0; i < n; i++) {
      (function (k) {
        var d = button('car-dot', 'Pilt ' + (k + 1) + '/' + n);
        d.addEventListener('click', function () { show(k); });
        dots.push(d);
        dotsWrap.appendChild(d);
      })(i);
    }

    var prev = button('car-nav car-prev', 'Eelmine pilt', CHEVRON_LEFT);
    var next = button('car-nav car-next', 'Järgmine pilt', CHEVRON_RIGHT);
    prev.addEventListener('click', function () { show(index - 1); });
    next.addEventListener('click', function () { show(index + 1); });

    car.appendChild(prev);
    car.appendChild(next);
    car.appendChild(dotsWrap);

    var startX = null;
    car.addEventListener('pointerenter', warm);
    car.addEventListener('focusin', warm);
    car.addEventListener('pointerdown', function (e) { startX = e.clientX; warm(); });
    car.addEventListener('pointerup', function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > SWIPE_MIN) show(dx < 0 ? index + 1 : index - 1);
    });
    car.addEventListener('pointercancel', function () { startX = null; });
    car.addEventListener('dragstart', function (e) { e.preventDefault(); });

    car.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { show(index - 1); e.preventDefault(); }
      if (e.key === 'ArrowRight') { show(index + 1); e.preventDefault(); }
    });

    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    var cars = document.querySelectorAll('.car');
    for (var i = 0; i < cars.length; i++) setup(cars[i]);
  });
})();
