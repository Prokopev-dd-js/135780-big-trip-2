import ApiService from './api-service.js';
import EventsModel from './model/events-model.js';
import DestinationsModel from './model/destinations-model.js';
import OffersModel from './model/offers-model.js';
import PagePresenter from './presenter/page-presenter.js';
import { getRandomString } from './utils/common.js';

const AUTHORIZATION = `Basic ${getRandomString(10)}`;
const END_POINT = 'https://23.objects.htmlacademy.pro/big-trip';

const apiService = new ApiService(END_POINT, AUTHORIZATION);

const tripEventsContainer = document.querySelector('.page-main .trip-events');
tripEventsContainer.innerHTML = '<p class="trip-events__msg">Loading...</p>';

Promise.all([
  apiService.getPoints(),
  apiService.getDestinations(),
  apiService.getOffers(),
])
  .then(([points, destinations, offers]) => {
    // Создаём модели с данными с сервера
    const eventsModel = new EventsModel(points, apiService);
    const destinationsModel = new DestinationsModel(destinations);
    const offersModel = new OffersModel(offers);

    // Инициализируем презентер страницы
    const pagePresenter = new PagePresenter(eventsModel, destinationsModel, offersModel);
    pagePresenter.init();
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Error loading data:', error);
    tripEventsContainer.innerHTML = '<p class="trip-events__msg">Failed to load latest route information</p>';
  });
