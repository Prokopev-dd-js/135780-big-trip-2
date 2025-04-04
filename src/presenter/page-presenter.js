import { render, RenderPosition } from '../framework/render.js';
import TripInfoView from '../view/trip-info-view.js';
import NoEventView from '../view/no-event-view.js';
import EventsListPresenter from './events-list-presenter.js';
import { UpdateType } from '../const.js';

export default class PagePresenter {
  #eventsModel = null;
  #destinationsModel = null;
  #offersModel = null;

  #events = [];
  #destinations = [];
  #offers = [];
  #eventPresenters = new Map();

  #tripMainElement = null;
  #tripEventElement = null;
  #eventListPresenter = null;
  #tripInfoView = null;

  constructor(eventsModel, destinationsModel, offersModel) {
    this.#eventsModel = eventsModel;
    this.#destinationsModel = destinationsModel;
    this.#offersModel = offersModel;
    this.#eventsModel.addObserver(this.#handleModelEvent);
  }

  init() {
    this.#events = [...this.#eventsModel.events];
    this.#destinations = [...this.#destinationsModel.destinations];
    this.#offers = [...this.#offersModel.offers];

    this.#tripMainElement = document.querySelector('.trip-main');
    this.#tripEventElement = document.querySelector('.page-main .trip-events');

    this.#tripEventElement.innerHTML = '';

    if (this.#events.length === 0) {
      this.#renderNoEvent();
      return;
    }

    this.#renderTripInfo();
    this.#renderEventList();
  }

  #handleModelEvent = (updateType) => {
    this.#events = [...this.#eventsModel.events];

    if (updateType === UpdateType.MINOR || updateType === UpdateType.MAJOR) {
      this.#updateTripCost();
    }
  };

  #calculateTotalCost() {
    return this.#events.reduce((total, event) => {
      const eventPrice = Number(event.basePrice) || 0;
      const offersPrice = Array.isArray(event.offers)
        ? event.offers.reduce((sum, offer) => sum + (Number(offer.price) || 0), 0)
        : 0;
      return total + eventPrice + offersPrice;
    }, 0);
  }

  #updateTripCost() {
    if (!this.#tripInfoView) {
      return;
    }
    const totalCost = this.#calculateTotalCost();
    this.#tripInfoView.updateTotalCost(totalCost);
  }

  #renderTripInfo() {
    const prevTripInfo = this.#tripMainElement.querySelector('.trip-info');
    if (prevTripInfo) {
      prevTripInfo.remove();
    }

    const totalCost = this.#calculateTotalCost();
    this.#tripInfoView = new TripInfoView({
      events: this.#events,
      destinations: this.#destinations,
      offers: this.#offers,
      totalCost
    });

    render(
      this.#tripInfoView,
      this.#tripMainElement,
      RenderPosition.AFTERBEGIN
    );
  }

  #renderNoEvent() {
    render(new NoEventView(), this.#tripEventElement);
  }

  #renderEventList() {
    this.#eventListPresenter = new EventsListPresenter(
      this.#eventsModel,
      this.#destinationsModel,
      this.#offersModel
    );
    this.#eventListPresenter.init();
    this.#eventPresenters = this.#eventListPresenter.getEventPresenters();
  }
}
