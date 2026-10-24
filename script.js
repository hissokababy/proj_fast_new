document.addEventListener('DOMContentLoaded', async () => {
  let dictionaries = {};
  let currentLanguage = 'uz';
  const languageButton = document.querySelector('#languageFlag');
  const languageMenu = document.querySelector('#languageMenu');

function getValue(dictionary, path) {
  if (!dictionary || !path) return undefined;

  // Соответствие старых ключей новым
  const aliases = {
    teachersKicker: 'teachers.text_001',
    teachersTitle: 'teachers.text_002',
    teachersText: 'teachers.text_003',
    teachersCta: 'teachers.text_004',

    resultsKicker: 'results.text_001',
    resultsTitle: 'results.text_002',
    resultsText: 'results.text_003',
    certNote: 'results.text_004',
    resultsCta: 'results.text_006'
  };

  const key = aliases[path] || path;

  // Ищем перевод по полному ключу
  if (Object.prototype.hasOwnProperty.call(dictionary, key)) {
    return dictionary[key];
  }

  // Запасной вариант для вложенных объектов
  return key.split('.').reduce(
    (value, part) => value?.[part],
    dictionary
  );
}

  async function loadTexts() {
    const response = await fetch('./texts.json');
    if (!response.ok) throw new Error(`texts.json: HTTP ${response.status}`);
    const data = await response.json();
    console.log('Загруженный texts.json:', data);
    console.log('Языки:', data.languages);
    dictionaries = {};
    for (const item of data.languages || []) {
      const code = Object.keys(item)[0];
      const language = item[code];
      const flattened = {};
      for (const [category, entries] of Object.entries(language.categories || {})) {
        for (const [key, value] of Object.entries(entries)) {
          flattened[`${category}.${key}`] = value;
        }
      }
      dictionaries[code] = { ...flattened, title: language.title, flag: language.flag };
    }
    let saved = 'uz';
    try { saved = localStorage.getItem('fastEasyLanguage') || 'uz'; } catch (_) {}
    setLanguage(saved);
  }

  function setLanguage(language) {
    currentLanguage = dictionaries[language] ? language : 'uz';
    const dictionary = dictionaries[currentLanguage];
    document.documentElement.lang = currentLanguage;

    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.dataset.i18n;
      const value = getValue(dictionary, key);

      if (typeof value === 'string') {
        element.textContent = value;
      } else {
        console.warn('Перевод не найден:', key, element);
      }
    });

    document.querySelectorAll('[data-i18n-attr]').forEach(element => {
      element.dataset.i18nAttr.split(/\s+/).forEach(rule => {
        const splitAt = rule.indexOf(':');
        if (splitAt < 1) return;
        const attribute = rule.slice(0, splitAt);
        const key = rule.slice(splitAt + 1);
        const value = getValue(dictionary, key);
        if (typeof value === 'string') element.setAttribute(attribute, value);
      });
    });

    if (languageButton) {
      languageButton.innerHTML = `${dictionary.flag || (currentLanguage === 'uz' ? '🇺🇿' : '🇷🇺')} <span>⌄</span>`;
      languageButton.setAttribute('aria-label', currentLanguage === 'uz' ? 'Tilni o‘zgartirish' : 'Изменить язык');
    }
    if (languageMenu) {
      languageMenu.querySelectorAll('[data-lang]').forEach(button => {
        button.hidden = button.dataset.lang === currentLanguage;
      });
    }
    try { localStorage.setItem('fastEasyLanguage', currentLanguage); } catch (_) {}
  }

  if (languageButton && languageMenu) {
    languageButton.addEventListener('click', event => {
      event.stopPropagation();
      languageMenu.hidden = !languageMenu.hidden;
      languageButton.setAttribute('aria-expanded', String(!languageMenu.hidden));
    });
    languageMenu.querySelectorAll('[data-lang]').forEach(button => {
      button.addEventListener('click', event => {
        event.stopPropagation();
        setLanguage(button.dataset.lang);
        languageMenu.hidden = true;
        languageButton.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('click', event => {
      if (!event.target.closest('.languagePicker')) {
        languageMenu.hidden = true;
        languageButton.setAttribute('aria-expanded', 'false');
      }
    });
  }

  document.querySelectorAll('.faq button').forEach(button => {
    button.addEventListener('click', () => {
      const item = button.closest('.faq');
      item.classList.toggle('open');
      const icon = button.querySelector('span:last-child');
      if (icon) icon.textContent = item.classList.contains('open') ? '−' : '+';
    });
  });

  const form = document.querySelector('#leadForm');
  if (form) form.addEventListener('submit', event => {
    event.preventDefault();
    const success = document.querySelector('#successMsg');
    if (success) success.style.display = 'block';
  });

  document.querySelectorAll('[data-carousel-prev],[data-carousel-next]').forEach(button => {
    button.addEventListener('click', () => {
      const id = button.dataset.carouselPrev || button.dataset.carouselNext;
      const track = document.getElementById(id);
      if (!track) return;
      const card = track.querySelector(':scope > *');
      const step = card ? card.getBoundingClientRect().width + 18 : track.clientWidth * 0.8;
      track.scrollBy({ left: button.dataset.carouselPrev ? -step : step, behavior: 'smooth' });
    });
  });

  ['centerCarousel', 'teachersCarousel', 'certCarousel'].forEach(id => {
    const track = document.getElementById(id);
    if (!track) return;
    track.classList.add('autoCarousel');
    let timer;
    const start = () => {
      if (timer || track.scrollWidth <= track.clientWidth) return;
      timer = setInterval(() => {
        if (track.matches(':hover') || track.contains(document.activeElement)) return;
        const max = track.scrollWidth - track.clientWidth;
        if (track.scrollLeft >= max - 4) track.scrollTo({ left: 0, behavior: 'smooth' });
        else track.scrollBy({ left: Math.max(220, track.clientWidth * 0.72), behavior: 'smooth' });
      }, 3200);
    };
    const stop = () => { clearInterval(timer); timer = null; };
    track.addEventListener('mouseenter', stop);
    track.addEventListener('mouseleave', start);
    track.addEventListener('focusin', stop);
    track.addEventListener('focusout', start);
    start();
  });

  document.querySelectorAll('[data-auto-rail]').forEach(track => {
    setInterval(() => {
      if (track.matches(':hover')) return;
      const max = track.scrollWidth - track.clientWidth;
      if (max < 2) return;
      if (track.scrollLeft >= max - 4) track.scrollTo({ left: 0, behavior: 'smooth' });
      else track.scrollBy({ left: Math.min(280, track.clientWidth * 0.65), behavior: 'smooth' });
    }, 3400);
  });

  const lightbox = document.createElement('div');
  lightbox.className = 'imageLightbox';
  lightbox.innerHTML = '<button type="button" aria-label="Close">×</button><img alt="">';
  document.body.appendChild(lightbox);
  const lightboxImage = lightbox.querySelector('img');
  document.querySelectorAll('.lightboxLink').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      lightboxImage.src = link.href;
      lightboxImage.alt = link.querySelector('img')?.alt || '';
      lightbox.classList.add('open');
    });
  });
  lightbox.addEventListener('click', event => {
    if (event.target === lightbox || event.target.tagName === 'BUTTON') lightbox.classList.remove('open');
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') lightbox.classList.remove('open');
  });

  try {
    await loadTexts();
  } catch (error) {
    console.error('Не удалось загрузить texts.json. Запустите сайт через Live Server.', error);
  }
});
