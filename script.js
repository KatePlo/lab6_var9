/***********************************************************
 * ЛАБОРАТОРНАЯ РАБОТА №6
 * JavaScript + DOM
 * АИС «Автовокзал — покупка билетов»
 ***********************************************************/

//1. ДАННЫЕ (ObjInf)

const initialRoutes = [];

for (let i = 1; i <= 20; i++) { // заполняет информацию о рейсах
  initialRoutes.push({
    id: String(i),
    description: `Рейс №${i}: Минск → Гродно`,
    createdAt: new Date(2025, 10, i),
    author: 'system',
    photoLink: null,

    from: 'Минск',
    to: 'Гродно',
    date: '2025-12-01',
    departureTime: `${8 + (i % 10)}:00`,
    arrivalTime: `${14 + (i % 6)}:30`,
    price: 70 + i,
    seatsAvailable: 20 - (i % 5)
  });
}

//2. КЛАСС КОЛЛЕКЦИИ (МОДЕЛЬ)
// хранение и обработка данных о рейсах

class RouteCollection {
  #routes = [];

  constructor(routes = []) {
    this.addAll(routes);
  }

  #validate(route) {
    return (
      typeof route.id === 'string' &&
      route.description &&
      route.description.length <= 200 &&
      route.createdAt instanceof Date &&
      route.author
    );
  }

  getObjs(skip = 0, top = 10, filterConfig = {}) {  // возвращает список рейсов 
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

  addObj(route) { // добавляет рейс 
    if (!this.#validate(route)) return false;
    this.#routes.push(route);
    return true;
  }

  addAll(routes) {
    routes.forEach(r => this.addObj(r));
  }

  editObj(id, changes) { // позволяет редактировать рейс 
    const route = this.getObj(id);
    if (!route) return false;

    const forbidden = ['id', 'author', 'createdAt'];
    Object.keys(changes).forEach(key => {
      if (!forbidden.includes(key)) {
        route[key] = changes[key];
      }
    });
    return true;
  }

  removeObj(id) {
    const index = this.#routes.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.#routes.splice(index, 1);
    return true;
  }
}

//3. VIEW (DOM)
    
class RouteView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  render(routes) { // не допускает дублиования рейсов 
    // очищаем всё, кроме заголовка "Результаты"
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
        <a href="#purchase?type=reservation" class="btn-outline">Забронировать</a>
        <a href="#purchase?type=buy" class="btn primary">Купить</a>
        <p class="hint">Кнопка "Купить" → форма оплаты</p>
      </div>
    `;
    return article;
  }
}

//4. ИНИЦИАЛИЗАЦИЯ
   

const collection = new RouteCollection(initialRoutes);
const view = new RouteView('search-results');

view.render(collection.getObjs());

//5. ГЛОБАЛЬНЫЕ ФУНКЦИИ (ДЛЯ КОНСОЛИ)
   
window.App = {
  addRoute(route) {
    collection.addObj(route);
    view.render(collection.getObjs());
  },

  removeRoute(id) {
    collection.removeObj(id);
    view.render(collection.getObjs());
  },

  editRoute(id, changes) {
    collection.editObj(id, changes);
    view.render(collection.getObjs());
  },

  filterByDestination(city) {
    view.render(collection.getObjs(0, 10, { to: city }));
  },

  getAll() {
    console.log(collection.getObjs());
  }
};

console.log('ЛР-6 инициализирована. Используйте объект App в консоли.');
