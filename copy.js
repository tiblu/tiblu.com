// Sale pages: "Copy" buttons next to the phone number and email, and selectable link text.
// Buttons carry data-copy="<text>" and start hidden, so they only appear when JS runs.
// Links with draggable="false" can be drag-selected; finishing a selection inside one
// must not also open the phone/mail app, so that click is cancelled.
(function () {
  var EN = document.documentElement.lang === 'en';
  var COPIED = EN ? 'Copied' : 'Kopeeritud';
  var CHECK = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12l5 5L20 7"></path></svg>';

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    return ok ? Promise.resolve() : Promise.reject();
  }

  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () { return fallbackCopy(text); });
    }
    return fallbackCopy(text);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var status = document.createElement('span');
    status.className = 'sr-only';
    status.setAttribute('aria-live', 'polite');
    document.body.appendChild(status);

    // A click is a drag-select when the pointer moved between press and release and text got selected;
    // a plain click (even on an already selected number) still calls / opens mail.
    var links = document.querySelectorAll('a[draggable="false"]');
    for (var j = 0; j < links.length; j++) {
      (function (a) {
        var downX = 0, downY = 0;
        a.addEventListener('mousedown', function (e) { downX = e.clientX; downY = e.clientY; });
        a.addEventListener('click', function (e) {
          var moved = Math.abs(e.clientX - downX) + Math.abs(e.clientY - downY) > 4;
          var sel = window.getSelection();
          if ((moved || e.detail > 1) && sel && sel.toString().trim()) e.preventDefault();
        });
      })(links[j]);
    }

    var buttons = document.querySelectorAll('[data-copy]');
    for (var i = 0; i < buttons.length; i++) {
      (function (b) {
        var original = b.innerHTML;
        var timer;
        b.hidden = false;
        b.addEventListener('click', function () {
          copy(b.getAttribute('data-copy')).then(function () {
            b.innerHTML = CHECK;
            b.classList.add('is-copied');
            b.title = COPIED;
            status.textContent = COPIED;
            clearTimeout(timer);
            timer = setTimeout(function () {
              b.innerHTML = original;
              b.classList.remove('is-copied');
              b.title = b.getAttribute('aria-label');
              status.textContent = '';
            }, 2000);
          });
        });
      })(buttons[i]);
    }
  });
})();
