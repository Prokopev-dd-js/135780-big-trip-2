import { render, replace, remove } from '../framework/render.js';
import { isEscape } from '../utils/common.js';
import { UserAction, UpdateType } from '../const.js';
import EventEditFormView from '../view/event-edit-form-view/event-edit-form-view.js';
import EventView from '../view/event-view/event-view.js';

export default class EventPresenter {
  #event = null;
  #events = [];
  #destinations = [];
  #offers = [];
  #tripEventsListElement = null;
  #eventComponent = null;
  #eventEditFormComponent = null;
  #onDataChange = null;
  #onResetView = null;
  #handleViewAction = null;
  renderEventList = null;
  static #currentlyEditing = null;
  #eventsModel = null;

  constructor(container, renderEventList, eventsModel, onDataChange, onResetView) {
    this.#tripEventsListElement = container;
    this.renderEventList = renderEventList;
    this.#eventsModel = eventsModel;
    this.#onDataChange = onDataChange;
    this.#onResetView = onResetView;
  }

  init(event, eventsModel, destinationsModel, offersModel, onDataChange, onResetView) {
    if (!this.#tripEventsListElement) {
      this.#tripEventsListElement = document.querySelector('.trip-events__list');
    }

    this.#event = event;
    this.#events = eventsModel;
    this.#destinations = destinationsModel.destinations;
    this.#offers = offersModel.offers;
    this.#onDataChange = onDataChange;
    this.#onResetView = onResetView;
    const prevEventComponent = this.#eventComponent;
    const prevEventEditComponent = this.#eventEditFormComponent;

    this.#eventComponent = new EventView({
      event: this.#event,
      events: this.#events,
      destinations: this.#destinations,
      offers: this.#offers,
      onEditClick: this.#handleEditClick,
      onFavoriteClick: this.#handleFavoriteClick
    });

    this.#eventEditFormComponent = new EventEditFormView({
      event,
      destinations: this.#destinations,
      offers: this.#offers,
      onFormSubmit: this.#handleFormSubmit,
      onEditClick: this.#handleCloseClick,
      onDeleteClick: this.#handleDeleteClick,
    });

    if (prevEventComponent && prevEventEditComponent) {
      replace(this.#eventComponent, prevEventComponent);
      replace(this.#eventEditFormComponent, prevEventEditComponent);
      remove(prevEventComponent);
      remove(prevEventEditComponent);
      return;
    }

    render(this.#eventComponent, this.#tripEventsListElement);
  }

  update(updatedEvent) {
    this.#event = updatedEvent;
  }

  resetView() {
    if (this.#tripEventsListElement.contains(this.#eventEditFormComponent.element)) {
      this.#handleCloseClick();
    }
  }

  destroy() {
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    remove(this.#eventComponent);
    remove(this.#eventEditFormComponent);
  }

  #handleFavoriteClick = () => {
    if (!this.#onDataChange) {
      return;
    }

    const updatedEvent = {
      ...this.#event,
      isFavorite: !this.#event.isFavorite,
    };

    this.#event = updatedEvent;
    this.#eventComponent.updateFavoriteButton(updatedEvent.isFavorite);

    const updatedEventFromServer = this.#eventsModel.updateEvent(updatedEvent);
    this.#eventComponent.updateFavoriteButton(updatedEventFromServer.isFavorite);

    this.#onDataChange(UserAction.UPDATE_EVENT, UpdateType.MINOR, updatedEventFromServer);
  };

  #handleEditClick = () => {
    const existingForms = document.querySelectorAll('.event--edit');
    const addNewEventButton = document.querySelector('.trip-main__event-add-btn');
    addNewEventButton.disabled = false;
    existingForms.forEach((form) => form.remove());

    if (EventPresenter.#currentlyEditing) {
      EventPresenter.#currentlyEditing.replaceFormToItem();
    }

    EventPresenter.#currentlyEditing = this;
    this.#replaceItemToForm();
  };

  #handleFormSubmit = async (updatedEvent) => {
    try {
      const updatedEventFromServer = await this.#eventsModel.updateEvent(updatedEvent);
      this.#event = updatedEventFromServer;
      this.#onDataChange(UserAction.UPDATE_EVENT, UpdateType.MINOR, updatedEventFromServer);
      this.#eventEditFormComponent.unlockForm();
      this.replaceFormToItem();
    } catch (error) {
      this.#eventEditFormComponent.unlockForm();
    }
  };

  #handleDeleteClick = async () => {
    try {
      await this.#eventsModel.deleteEvent(this.#event.id);
      this.#eventEditFormComponent.unlockForm();
      this.destroy();
    } catch (error) {
      this.#eventEditFormComponent.unlockForm();
      throw error;
    }
  };

  #handleCloseClick = () => {
    this.replaceFormToItem();
  };

  #replaceItemToForm() {
    if (!this.#eventComponent.element.parentElement) {
      return;
    }

    if (this.#eventEditFormComponent) {
      remove(this.#eventEditFormComponent);
    }

    this.#eventEditFormComponent = new EventEditFormView({
      event: this.#event,
      destinations: this.#destinations,
      offers: this.#offers,
      onFormSubmit: this.#handleFormSubmit,
      onEditClick: this.#handleCloseClick,
      onDeleteClick: this.#handleDeleteClick,
    });

    replace(this.#eventEditFormComponent, this.#eventComponent);
    remove(this.#eventComponent);

    document.addEventListener('keydown', this.#escKeyDownHandler);
  }

  replaceFormToItem() {
    if (!this.#eventEditFormComponent || !this.#eventEditFormComponent.element.parentElement) {
      return;
    }

    this.#eventComponent = new EventView({
      event: this.#event,
      destinations: this.#destinations,
      offers: this.#offers,
      onEditClick: this.#handleEditClick,
      onFavoriteClick: this.#handleFavoriteClick
    });

    replace(this.#eventComponent, this.#eventEditFormComponent);
    remove(this.#eventEditFormComponent);
    this.#eventEditFormComponent = null;

    EventPresenter.#currentlyEditing = null;

    document.removeEventListener('keydown', this.#escKeyDownHandler);
  }

  #escKeyDownHandler = (evt) => {
    if (isEscape(evt)) {
      evt.preventDefault();
      this.#handleCloseClick();
    }
  };
}
