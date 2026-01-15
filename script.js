(function() {
  'use strict';

  if (window.__wanderlustApp && window.__wanderlustApp.initialized) {
    return;
  }

  window.__wanderlustApp = {
    initialized: true,
    state: {
      burgerOpen: false,
      formSubmitting: false,
      pollSubmitted: false
    }
  };

  const app = window.__wanderlustApp;

  function debounce(fn, wait) {
    let timer;
    return function() {
      const args = arguments;
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(null, args), wait);
    };
  }

  function throttle(fn, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      if (!inThrottle) {
        fn.apply(null, args);
        inThrottle = true;
        setTimeout(() => { inThrottle = false; }, limit);
      }
    };
  }

  function initBurgerMenu() {
    const toggle = document.querySelector('.navbar-toggler, .c-nav__toggle');
    const nav = document.querySelector('.navbar-collapse, .c-nav');
    const navList = document.querySelector('.navbar-nav, .c-nav__list');
    
    if (!toggle || !navList) return;

    const body = document.body;
    const navLinks = navList.querySelectorAll('.nav-link, .c-nav__link');

    function openMenu() {
      app.state.burgerOpen = true;
      if (nav) nav.classList.add('is-open');
      navList.classList.add('show');
      toggle.setAttribute('aria-expanded', 'true');
      body.classList.add('u-no-scroll');
    }

    function closeMenu() {
      app.state.burgerOpen = false;
      if (nav) nav.classList.remove('is-open');
      navList.classList.remove('show');
      toggle.setAttribute('aria-expanded', 'false');
      body.classList.remove('u-no-scroll');
    }

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (app.state.burgerOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (app.state.burgerOpen) {
          closeMenu();
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && app.state.burgerOpen) {
        closeMenu();
      }
    });

    const resizeHandler = throttle(() => {
      if (window.innerWidth >= 1024 && app.state.burgerOpen) {
        closeMenu();
      }
    }, 200);

    window.addEventListener('resize', resizeHandler, { passive: true });
  }

  function initActiveMenu() {
    const path = location.pathname;
    const links = document.querySelectorAll('.nav-link, .c-nav__link');

    links.forEach(link => {
      link.removeAttribute('aria-current');
      link.classList.remove('active');
    });

    links.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;

      const normPath = href.replace(/^.\//, '').replace(/^\/+/, '/');
      const currentPath = path.replace(/^\/+/, '/');

      if (normPath === '/' || normPath === '/index.html') {
        if (currentPath === '/' || currentPath === '/index.html' || currentPath.match(/\/index.html$/)) {
          link.setAttribute('aria-current', 'page');
          link.classList.add('active');
        }
      } else if (currentPath === normPath) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('active');
      }
    });
  }

  function initSmoothScroll() {
    const isHomepage = location.pathname === '/' || location.pathname === '/index.html' || location.pathname.match(/\/index.html$/);
    const header = document.querySelector('.l-header, .navbar');

    function getOffset() {
      return header ? header.offsetHeight : 80;
    }

    document.addEventListener('click', (e) => {
      let target = e.target;
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }

      if (!target) return;

      const href = target.getAttribute('href');
      if (!href || href === '#' || href === '#!') return;

      if (href.indexOf('#') === 0) {
        e.preventDefault();
        const id = href.substring(1);
        const section = document.getElementById(id);
        if (section) {
          const offsetTop = section.getBoundingClientRect().top + window.pageYOffset - getOffset();
          window.scrollTo({ top: offsetTop, behavior: 'smooth' });
        }
      } else if (href.indexOf('/#') === 0 && isHomepage) {
        e.preventDefault();
        const sectionId = href.substring(2);
        const section = document.getElementById(sectionId);
        if (section) {
          const offsetTop = section.getBoundingClientRect().top + window.pageYOffset - getOffset();
          window.scrollTo({ top: offsetTop, behavior: 'smooth' });
        }
      }
    });
  }

  function initScrollSpy() {
    const sections = document.querySelectorAll('[id^="section-"]');
    const links = document.querySelectorAll('.nav-link[href^="#"], .c-nav__link[href^="#"]');
    
    if (sections.length === 0 || links.length === 0) return;

    const header = document.querySelector('.l-header, .navbar');
    const offset = header ? header.offsetHeight + 50 : 130;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            links.forEach(link => {
              const href = link.getAttribute('href');
              if (href === `#${id}`) {
                link.classList.add('active');
              } else {
                link.classList.remove('active');
              }
            });
          }
        });
      },
      { rootMargin: `-${offset}px 0px -50% 0px` }
    );

    sections.forEach(section => observer.observe(section));
  }

  function initLazyImages() {
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach(img => {
      if (!img.classList.contains('c-logo__img') && !img.hasAttribute('data-critical')) {
        img.setAttribute('loading', 'lazy');
      }
      if (!img.classList.contains('img-fluid')) {
        img.classList.add('img-fluid');
      }
    });

    const videos = document.querySelectorAll('video:not([loading])');
    videos.forEach(video => {
      video.setAttribute('loading', 'lazy');
    });
  }

  function showNotification(message, type = 'info') {
    let container = document.getElementById('notification-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'notification-container';
      container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;max-width:400px;';
      document.body.appendChild(container);
    }

    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show`;
    notification.setAttribute('role', 'alert');
    notification.style.cssText = 'box-shadow:0 4px 12px rgba(0,0,0,0.15);margin-bottom:10px;';
    notification.innerHTML = `${message}<button type="button" class="btn-close" aria-label="Schließen"></button>`;

    container.appendChild(notification);

    const closeBtn = notification.querySelector('.btn-close');
    closeBtn.addEventListener('click', () => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 150);
    });

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 150);
    }, 5000);
  }

  function validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const name = field.name;
    const group = field.closest('.c-form__group, .form-group, .mb-3, .mb-4');

    let isValid = true;
    let errorMsg = '';

    if (field.hasAttribute('required') && !value) {
      isValid = false;
      errorMsg = 'Dieses Feld ist erforderlich.';
    } else if (value) {
      if (type === 'email' || name === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          isValid = false;
          errorMsg = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
        }
      } else if (type === 'tel' || name === 'phone') {
        const phoneRegex = /^[\+\d\s\(\)\-]{7,20}$/;
        if (!phoneRegex.test(value)) {
          isValid = false;
          errorMsg = 'Bitte geben Sie eine gültige Telefonnummer ein.';
        }
      } else if (name === 'firstName' || name === 'lastName') {
        const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/;
        if (!nameRegex.test(value)) {
          isValid = false;
          errorMsg = 'Bitte geben Sie einen gültigen Namen ein (2-50 Zeichen).';
        }
      } else if (field.tagName === 'TEXTAREA' && name === 'message') {
        if (value.length < 10) {
          isValid = false;
          errorMsg = 'Die Nachricht muss mindestens 10 Zeichen enthalten.';
        }
      }
    }

    if (field.type === 'checkbox' && field.hasAttribute('required') && !field.checked) {
      isValid = false;
      errorMsg = 'Bitte akzeptieren Sie die erforderlichen Bedingungen.';
    }

    if (group) {
      if (isValid) {
        group.classList.remove('has-error');
        const errorElement = group.querySelector('.invalid-feedback, .c-form__error');
        if (errorElement) errorElement.textContent = '';
      } else {
        group.classList.add('has-error');
        let errorElement = group.querySelector('.invalid-feedback, .c-form__error');
        if (!errorElement) {
          errorElement = document.createElement('div');
          errorElement.className = 'invalid-feedback c-form__error';
          group.appendChild(errorElement);
        }
        errorElement.textContent = errorMsg;
      }
    }

    return isValid;
  }

  function initForms() {
    const forms = document.querySelectorAll('form.c-form, form[class*="needs-validation"]');

    forms.forEach(form => {
      const fields = form.querySelectorAll('input, textarea, select');
      
      fields.forEach(field => {
        field.addEventListener('blur', () => validateField(field));
        field.addEventListener('input', () => {
          const group = field.closest('.c-form__group, .form-group, .mb-3, .mb-4');
          if (group && group.classList.contains('has-error')) {
            validateField(field);
          }
        });
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (app.state.formSubmitting) return;

        let isFormValid = true;
        const requiredFields = form.querySelectorAll('[required]');

        requiredFields.forEach(field => {
          if (!validateField(field)) {
            isFormValid = false;
          }
        });

        if (!isFormValid) {
          showNotification('Bitte füllen Sie alle erforderlichen Felder korrekt aus.', 'danger');
          return;
        }

        app.state.formSubmitting = true;
        const submitBtn = form.querySelector('button[type="submit"]');
        let originalText = '';

        if (submitBtn) {
          originalText = submitBtn.innerHTML;
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Wird gesendet...';
        }

        setTimeout(() => {
          showNotification('Vielen Dank! Ihre Anfrage wurde erfolgreich gesendet.', 'success');
          
          setTimeout(() => {
            window.location.href = 'thank_you.html';
          }, 1000);

          app.state.formSubmitting = false;
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
          }
        }, 1500);
      });
    });
  }

  function initPollForm() {
    const pollForm = document.getElementById('pollForm');
    if (!pollForm) return;

    if (app.state.pollSubmitted) return;

    const pollResults = {
      poll1: 35,
      poll2: 28,
      poll3: 22,
      poll4: 15
    };

    pollForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const selected = pollForm.querySelector('input[name="destination"]:checked');
      if (!selected) {
        showNotification('Bitte wählen Sie eine Option aus.', 'warning');
        return;
      }

      app.state.pollSubmitted = true;

      const resultsSection = document.getElementById('poll-results');
      if (resultsSection) {
        resultsSection.classList.remove('u-hidden');
        resultsSection.style.display = 'block';
      }

      pollForm.style.display = 'none';

      Object.keys(pollResults).forEach(id => {
        const bar = document.getElementById(`bar${id.replace('poll', '')}`);
        if (bar) {
          setTimeout(() => {
            bar.style.width = pollResults[id] + '%';
            bar.setAttribute('aria-valuenow', pollResults[id]);
            bar.textContent = pollResults[id] + '%';
          }, 100);
        }
      });

      showNotification('Vielen Dank für Ihre Teilnahme!', 'success');
    });
  }

  function initScrollToTop() {
    let scrollBtn = document.getElementById('scroll-to-top');
    
    if (!scrollBtn) {
      scrollBtn = document.createElement('button');
      scrollBtn.id = 'scroll-to-top';
      scrollBtn.className = 'btn btn-primary c-button';
      scrollBtn.setAttribute('aria-label', 'Nach oben scrollen');
      scrollBtn.innerHTML = '↑';
      scrollBtn.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:999;width:50px;height:50px;border-radius:50%;display:none;';
      document.body.appendChild(scrollBtn);
    }

    const toggleVisibility = throttle(() => {
      if (window.pageYOffset > 300) {
        scrollBtn.style.display = 'flex';
      } else {
        scrollBtn.style.display = 'none';
      }
    }, 200);

    window.addEventListener('scroll', toggleVisibility, { passive: true });

    scrollBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function initPrivacyModal() {
    const privacyLinks = document.querySelectorAll('a[href*="privacy"]');
    
    privacyLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && (href.includes('privacy.html') || href.includes('#privacy'))) {
          if (location.pathname !== '/privacy.html') {
            return;
          }
        }
      });
    });
  }

  function initHoneypot() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      const honeypot = document.createElement('input');
      honeypot.type = 'text';
      honeypot.name = 'website';
      honeypot.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;';
      honeypot.tabIndex = -1;
      honeypot.autocomplete = 'off';
      form.appendChild(honeypot);
    });
  }

  function initCountUp() {
    const stats = document.querySelectorAll('[data-count-up]');
    if (stats.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !entry.target.dataset.counted) {
            entry.target.dataset.counted = 'true';
            const target = parseInt(entry.target.dataset.countUp);
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;

            const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                entry.target.textContent = target;
                clearInterval(timer);
              } else {
                entry.target.textContent = Math.floor(current);
              }
            }, 16);
          }
        });
      },
      { threshold: 0.5 }
    );

    stats.forEach(stat => observer.observe(stat));
  }

  function initHeaderScroll() {
    const header = document.querySelector('.l-header, .navbar');
    if (!header) return;

    const scrollHandler = throttle(() => {
      if (window.pageYOffset > 50) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }, 100);

    window.addEventListener('scroll', scrollHandler, { passive: true });
  }

  function init() {
    initBurgerMenu();
    initActiveMenu();
    initSmoothScroll();
    initScrollSpy();
    initLazyImages();
    initForms();
    initPollForm();
    initScrollToTop();
    initPrivacyModal();
    initHoneypot();
    initCountUp();
    initHeaderScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();