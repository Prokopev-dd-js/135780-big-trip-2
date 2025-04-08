import { FILTERS } from '../const.js';
import { render } from '../framework/render.js';
import EventListView from '../view/event-list-view.js';
import EventPresenter from './event-presenter.js';

export default class EventsListPresenter {
  #events = [];
  #destinationsModel;
  #offersModel;
  #eventPresenters = new Map();
  #eventListComponent = new EventListView();
  #tripEventElement;
  #currentFilterType = FILTERS[0].type;
  #onDataChange = null;
  #resetView = null;

  constructor(eventsModel, destinationsModel, offersModel, onDataChange, resetView) {
    this.eventsModel = eventsModel;
    this.#destinationsModel = destinationsModel;
    this.#offersModel = offersModel;
    this.#onDataChange = onDataChange;
    this.#resetView = resetView;
  }

  init(events) {
    this.#events = [...events];
    this.#tripEventElement = document.querySelector('.page-main .trip-events');

    this.#renderEventList();
  }

  #renderEventList() {
    this.#clearEventList();

    if (!this.#events.length) {
      document.querySelector(`#filter-${this.#currentFilterType}`).disabled = true;
      return;
    }

    render(this.#eventListComponent, this.#tripEventElement);
    this.#events.forEach((event) => this.#renderEvent(event));
  }

  #renderEvent(event) {
    const eventPresenter = new EventPresenter(
      this.#tripEventElement.querySelector('.trip-events__list'),
      this.renderEventList,
      this.eventsModel,
      this.#onDataChange,
      this.#resetView,
    );

    eventPresenter.init(event, this.eventsModel, this.#destinationsModel, this.#offersModel, this.#onDataChange, this.#resetView);
    this.#eventPresenters.set(event.id, eventPresenter);
  }

  updateEvents(events) {
    this.#events = [...events];
    this.#renderEventList();
  }

  #clearEventList() {
    this.#eventPresenters.forEach((presenter) => presenter.destroy());
    this.#eventPresenters.clear();
    this.#tripEventElement.innerHTML = '';
  }
}
