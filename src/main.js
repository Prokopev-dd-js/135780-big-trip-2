import EventsModel from './model/events-model.js';
import DestinationsModel from './model/destinations-model.js';
import OffersModel from './model/offers-model.js';
import PagePresenter from './presenter/page-presenter.js';

const eventsModel = new EventsModel();
const destinationsModel = new DestinationsModel();
const offersModel = new OffersModel();

const pagePresenter = new PagePresenter(eventsModel, destinationsModel, offersModel);

(async () => {
  await eventsModel.init();
  await destinationsModel.init();
  await offersModel.init();

  pagePresenter.init();
})();
