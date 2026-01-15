(function () {
  var header = document.querySelector('.dr-header');
  if (!header) return;

  var toggle = header.querySelector('.dr-nav-toggle');
  var panel = header.querySelector('.dr-nav-panel');
  if (!toggle || !panel) return;

  function closePanel() {
    toggle.setAttribute('aria-expanded', 'false');
    panel.classList.remove('dr-nav-panel-open');
    panel.setAttribute('aria-hidden', 'true');
  }

  toggle.addEventListener('click', function () {
    var expanded = toggle.getAttribute('aria-expanded') === 'true';
    if (expanded) {
      closePanel();
    } else {
      toggle.setAttribute('aria-expanded', 'true');
      panel.classList.add('dr-nav-panel-open');
      panel.setAttribute('aria-hidden', 'false');
    }
  });

  header.addEventListener('click', function (event) {
    var target = event.target;
    if (!panel.contains(target) && target !== toggle && !toggle.contains(target)) {
      return;
    }
    if (target.closest('.dr-nav-panel-link')) {
      closePanel();
    }
  });
})();
