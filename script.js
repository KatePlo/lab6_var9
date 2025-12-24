/***********************************************************
 * ЛАБОРАТОРНАЯ РАБОТА №7
 * Events + LocalStorage
 * АИС «Автовокзал — покупка билетов»
 ***********************************************************/

/* ---------- 1. НАЧАЛЬНЫЕ ДАННЫЕ ---------- */

const initialRoutes = [];

for (let i = 1; i <= 20; i++) {
  initialRoutes.push({
    id: String(i),
    description: `Рейс №${i}: Минск → Гродно`,
    createdAt: new Date(2025, 10, i),
    author: 'system',

    from: 'Минск',
    to: 'Гродно',
    date: '2025-12-01',
    departureTime: `${8 + (i % 10)}:00`,
    arrivalTime: `${14 + (i % 6)}:30`,
    price: 70 + i,
    seatsAvailable: 20 - (i % 5)
  });
}

/* ---------- 2. MODEL (RouteCollection) ---------- */

class RouteCollection {
  #routes = [];

  constructor(routes = []) {
    this.restore();
    if (this.#routes.length === 0) {
      this.addAll(routes);
      this.save();
    }
  }

  #validate(route) {
    return (
      typeof route.id === 'string' &&
      route.description &&
      route.createdAt instanceof Date &&
      route.author
    );
  }

  getObjs(skip = 0, top = 10, filterConfig = {}) {
    let result = [...this.#routes];

    Object.keys(filterConfig).forEach(key => {
      result = result.filter(r => r[key] === filterConfig[key]);
    });

    result.sort((a, b) => b.createdAt - a.createdAt);
    return result.slice(skip, skip + top);
  }

  getObj(id) {
    return this.#routes.find(r => r.id === id);
  }

  addObj(route) {
    if (!this.#validate(route)) return false;
    this.#routes.push(route);
    this.save();
    return true;
  }

  addAll(routes) {
    routes.forEach(r => this.addObj(r));
  }

  editObj(id, changes) {
    const route = this.getObj(id);
    if (!route) return false;

    const forbidden = ['id', 'author', 'createdAt'];
    Object.keys(changes).forEach(key => {
      if (!forbidden.includes(key)) {
        route[key] = changes[key];
      }
    });

    this.save();
    return true;
  }

  removeObj(id) {
    const index = this.#routes.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.#routes.splice(index, 1);
    this.save();
    return true;
  }

  /* ---------- LocalStorage ---------- */

  save() {
    localStorage.setItem(
      'routes',
      JSON.stringify(this.#routes)
    );
  }

  restore() {
    const data = JSON.parse(localStorage.getItem('routes'));
    if (Array.isArray(data)) {
      this.#routes = data.map(r => ({
        ...r,
        createdAt: new Date(r.createdAt)
      }));
    }
  }
}

/* ---------- 3. VIEW ---------- */

class RouteView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  render(routes) {
    this.container.querySelectorAll('.route').forEach(e => e.remove());

    routes.forEach(route => {
      this.container.insertBefore(
        this.#createRoute(route),
        this.container.querySelector('.more-pages')
      );
    });
  }

  #createRoute(route) {
    const article = document.createElement('article');
    article.className = 'route';
    article.dataset.id = route.id;

    article.innerHTML = `
      <div class="route-left">
        <div class="route-title">${route.from} → ${route.to}</div>
        <div class="meta">
          Дата: ${route.date} • Отпр.: ${route.departureTime} • Приб.: ${route.arrivalTime}
        </div>
        <div class="seats ${route.seatsAvailable > 0 ? 'ok' : 'no'}">
          Места доступны: <strong>${route.seatsAvailable}</strong>
        </div>
        <div class="price">От <strong>${route.price} BYN</strong></div>
      </div>
      <div class="route-right">
        <a href="#route-details" class="btn">Подробнее</a>
        <a href="#purchase" class="btn primary">Купить</a>
      </div>
    `;
    return article;
  }
}

/* ---------- 4. CONTROLLER ---------- */

const Controller = (function () {
  const collection = new RouteCollection(initialRoutes);
  const view = new RouteView('search-results');

  function init() {
    view.render(collection.getObjs());

    // submit формы поиска
    document
      .querySelector('.search-form')
      .addEventListener('submit', onSearch);

    // делегирование кликов
    document
      .getElementById('search-results')
      .addEventListener('click', onRouteClick);
  }

  function onSearch(e) {
    e.preventDefault();

    const form = e.target;
    const to = form.elements.to.value;

    const filter = to ? { to } : {};
    view.render(collection.getObjs(0, 10, filter));
  }

  function onRouteClick(e) {
    const routeEl = e.target.closest('.route');
    if (!routeEl) return;

    console.log(
      'Выбран рейс:',
      collection.getObj(routeEl.dataset.id)
    );
  }

  return { init };
})();

/* ---------- 5. ИНИЦИАЛИЗАЦИЯ ---------- */

document.addEventListener('DOMContentLoaded', Controller.init);

/* ---------- 6. ДОСТУП ДЛЯ КОНСОЛИ (разрешено) ---------- */

window.App = {
  getAll() {
    console.log('Рейсы:', localStorage.getItem('routes'));
  }
};

console.log('ЛР-7 инициализирована');
