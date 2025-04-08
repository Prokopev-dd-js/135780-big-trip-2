import { render, RenderPosition } from '../framework/render.js';
import { FILTERS, SORTS } from '../const.js';
import TripInfoView from '../view/trip-info-view.js';
import NewEventPresenter from './new-event-presenter.js';
import NoEventView from '../view/no-event-view.js';
import EventsListPresenter from './events-list-presenter.js';
import FiltersView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import UserMessageView from '../view/user-message-view.js';

export default class PagePresenter {
  #events = [];
  #destinations = [];
  #offers = [];
  #eventPresenters = new Map();
  #tripInfoComponent = null;
  #userMessageComponent = null;
  #tripMainElement = null;
  #eventListPresenter = null;
  #tripEventElement = null;
  #newEventPresenter = null;

  #currentFilterType = FILTERS[0].type;
  #currentSortType = SORTS[0].type;

  #isFiltersAndSortRendered = false;
  #isLoading = true;
  #loadingComponent = null;

  constructor(eventsModel, destinationsModel, offersModel) {
    this.eventsModel = eventsModel;
    this.destinationsModel = destinationsModel;
    this.offersModel = offersModel;

    this.#tripMainElement = document.querySelector('.trip-main');
    this.#tripEventElement = document.querySelector('.trip-events');

    this.eventsModel.addObserver(this.#handleModelUpdate);
  }

  init() {
    this.#renderLoading();

    this.#updateData();

    this.#isLoading = false;

    this.#clearLoading();

    if (this.#events.length === 0) {
      this.#renderNoEvent();
    }

    const newEventButton = document.querySelector('.trip-main__event-add-btn');
    newEventButton.addEventListener('click', this.#handleNewEventClick);

    if (!this.#isDataLoaded()) {
      return;
    }

    this.#renderTripInfo();

    if (!this.#isFiltersAndSortRendered) {
      this.#renderFilters();
      this.#renderSort();
      this.#isFiltersAndSortRendered = true;
    }

    this.#renderEventList();
  }


  #renderLoading() {
    this.#loadingComponent = new UserMessageView('loading');
    render(this.#loadingComponent, this.#tripEventElement, RenderPosition.AFTERBEGIN);
  }

  #clearLoading() {
    if (this.#loadingComponent) {
      this.#loadingComponent.element.remove();
      this.#loadingComponent = null;
    }
  }

  updateEvent(updatedEvent) {
    this.eventsModel.updateEvent(updatedEvent);
  }

  #handleModelUpdate = () => {
    this.#updateData();

    if (!this.#isDataLoaded()) {
      return;
    }

    if (this.#events.length === 0) {
      this.#tripEventElement.innerHTML = '';
      this.#renderNoEvent();
    } else {
      this.#renderTripInfo();
      this.#renderEventList();
    }
  };

  #updateData() {
    this.#events = [...this.eventsModel.events];
    this.#destinations = [...this.destinationsModel.destinations];
    this.#offers = [...this.offersModel.offers];
  }

  #isDataLoaded() {
    return this.#events.length > 0 && this.#destinations.length > 0 && this.#offers.length > 0;
  }

  #handleNewEventClick = () => {
    this.#currentFilterType = FILTERS[0].type;
    this.#currentSortType = SORTS[0].type;

    this.#eventPresenters.forEach((presenter) => presenter.destroy());
    this.#eventPresenters.clear();

    const existingForms = document.querySelectorAll('.event--edit');
    existingForms.forEach((form) => form.remove());

    if (this.#newEventPresenter) {
      return;
    }

    this.#renderFilters();
    this.#renderSort();
    this.#isFiltersAndSortRendered = true;

    let eventListContainer = document.querySelector('.trip-events__list');
    if (!eventListContainer) {
      eventListContainer = document.createElement('ul');
      eventListContainer.classList.add('trip-events__list');
      this.#tripEventElement.appendChild(eventListContainer);
    }

    this.#removeNoEvent();
    document.querySelector('.trip-main__event-add-btn').disabled = true;

    this.#newEventPresenter = new NewEventPresenter({
      container: eventListContainer,
      eventsModel: this.eventsModel,
      destinationsModel: this.destinationsModel,
      offersModel: this.offersModel,
      onDataChange: this.updateEvent,
      onCloseForm: this.#handleCloseForm,
    });

    this.#newEventPresenter.init();
  };

  #handleCloseForm = () => {
    const existingForms = document.querySelectorAll('.event-edit-form');
    existingForms.forEach((form) => form.remove());

    this.#newEventPresenter = null;

    const newEventButton = document.querySelector('.trip-main__event-add-btn');
    if (newEventButton) {
      newEventButton.disabled = false;
    }

    if (this.#events.length === 0) {
      this.#renderNoEvent();
    } else {
      this.#clearEventList();
      this.#renderTripInfo();
      this.#renderFilters();
      this.#renderSort();
      this.#renderEventList();
    }
  };


  #renderNoEvent() {
    render(new NoEventView(this.#currentFilterType), this.#tripEventElement);
  }

  #removeNoEvent() {
    const noEventElement = this.#tripEventElement.querySelector('.trip-events__msg');
    if (noEventElement) {
      noEventElement.remove();
    }
  }

  #renderTripInfo() {
    if (this.#tripInfoComponent) {
      this.#tripInfoComponent.element.remove();
      this.#tripInfoComponent = null;
    }

    this.#tripInfoComponent = new TripInfoView(this.#events, this.#destinations, this.#offers);
    render(this.#tripInfoComponent, this.#tripMainElement, RenderPosition.AFTERBEGIN);
  }

  #renderFilters() {
    const filtersContainer = document.querySelector('.trip-controls__filters');
    filtersContainer.innerHTML = '';

    render(new FiltersView({
      filters: FILTERS,
      currentFilterType: this.#currentFilterType,
      onFilterChange: this.#handleFilterChange,
      events: this.#events,
    }), filtersContainer);
  }

  #applyFilter(events, filterType) {
    if (!Array.isArray(events)) {
      return [];
    }

    const now = new Date();
    return events.filter((event) => (
      {
        future: event.dateFrom > now,
        present: event.dateFrom <= now && event.dateTo >= now,
        past: event.dateTo < now,
      }[filterType] ?? true
    ));
  }

  #handleFilterChange = (filterType) => {
    this.#currentFilterType = filterType;
    this.#currentSortType = SORTS[0].type;
    this.#updateData();
    this.#clearEventList();
    this.#renderFilters();
    this.#renderSort();
    this.#renderEventList();
  };

  #renderSort() {
    const oldSort = this.#tripEventElement.querySelector('.trip-sort');
    if (oldSort) {
      oldSort.remove();
    }

    render(new SortView({
      sorts: SORTS,
      currentSortType: this.#currentSortType,
      onSortChange: this.#handleSortChange,
    }), this.#tripEventElement, RenderPosition.AFTERBEGIN);
  }

  #applySort(events, sortType) {
    const sortOption = SORTS.find((sort) => sort.type === sortType);

    if (!sortOption) {
      return [...events];
    }

    return [...events].sort(sortOption.sort);
  }

  #handleSortChange = (sortType) => {
    this.#currentSortType = sortType;
    this.#updateData();
    this.#clearEventList();
    this.#renderEventList();
    this.#renderSort();
  };

  #getFilteredAndSortedEvents() {
    const filteredEvents = this.#applyFilter(this.#events, this.#currentFilterType);
    const sortedEvents = this.#applySort(filteredEvents, this.#currentSortType);
    return sortedEvents;
  }

  #renderEventList() {
    this.#clearEventList();
    this.#removeUserMessage();

    const filteredAndSortedEvents = this.#getFilteredAndSortedEvents();

    if (filteredAndSortedEvents.length === 0) {
      const emptyListContainer = document.createElement('ul');
      emptyListContainer.classList.add('trip-events__list');
      this.#tripEventElement.appendChild(emptyListContainer);

      this.#userMessageComponent = new UserMessageView(this.#currentFilterType);
      render(this.#userMessageComponent, emptyListContainer);
      return;
    }


    this.#eventListPresenter = new EventsListPresenter(
      this.eventsModel,
      this.destinationsModel,
      this.offersModel,
      this.#handleViewAction,
    );

    this.#eventListPresenter.init(filteredAndSortedEvents);
    this.#renderSort();
  }


  #removeUserMessage() {
    if (this.#userMessageComponent) {
      this.#userMessageComponent.element.remove();
      this.#userMessageComponent = null;
    }
  }

  #clearEventList() {
    this.#eventPresenters.forEach((presenter) => presenter.destroy());
    this.#eventPresenters.clear();

    const eventListContainer = this.#tripEventElement.querySelector('.trip-events__list');
    if (eventListContainer) {
      eventListContainer.remove();
    }
  }


  #handleViewAction = (update) => {
    this.updateEvent(update);
  };
}
