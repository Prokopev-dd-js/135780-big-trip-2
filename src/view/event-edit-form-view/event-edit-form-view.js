import AbstractStatefulView from '../../framework/view/abstract-stateful-view.js';
import { createEventEditFormTemplate } from './event-edit-form-view-template.js';
import { EVENT_TYPES } from '../../const.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import '../../framework/view/abstract-view.css';

const BLANK_EVENT = {
  id: '',
  basePrice: 0,
  dateFrom: null,
  dateTo: null,
  destination: '',
  isFavourite: false,
  offers: [],
  type: EVENT_TYPES[5],
};

export default class EventEditFormView extends AbstractStatefulView {
  #destinations = [];
  #offers = [];
  #handleFormSubmit = null;
  #handleEditClick = null;
  #datepickerStart = null;
  #datepickerEnd = null;
  #handleDeleteClick = null;
  _isSaving = false;
  _isDeleting = false;

  constructor({ event = BLANK_EVENT, destinations, offers, onFormSubmit, onEditClick, onDeleteClick }) {
    super();
    this._state = EventEditFormView.parseEventToState(event);
    this.#destinations = destinations;
    this.#offers = offers;
    this.#handleFormSubmit = onFormSubmit;
    this.#handleEditClick = onEditClick;
    this.#handleDeleteClick = onDeleteClick;
    this._restoreHandlers();
  }

  get template() {
    return createEventEditFormTemplate(this._state, this.#destinations, this.#offers, this._isSaving, this._isDeleting);
  }

  updateElement(updatedState) {
    super.updateElement(updatedState);
    this._restoreHandlers();
  }

  removeElement() {
    super.removeElement();
    if (this.#datepickerStart) {
      this.#datepickerStart.destroy();
      this.#datepickerStart = null;
    }
    if (this.#datepickerEnd) {
      this.#datepickerEnd.destroy();
      this.#datepickerEnd = null;
    }
  }

  _restoreHandlers() {
    const resetButton = this.element.querySelector('.event__reset-btn');
    resetButton.textContent = this._state.id ? 'Delete' : 'Cancel';
    this.element.querySelector('.event__type-group').addEventListener('change', this.#eventTypeChangeHandler);
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#destinationChangeHandler);
    this.#setDatepickers();
    this.element.querySelector('.event__input--price').addEventListener('input', this.#priceChangeHandler);
    this.element.querySelectorAll('.event__offer-checkbox').forEach((checkbox) => checkbox.addEventListener('change', this.#offersChangeHandler));
    this.element.querySelector('.event--edit').addEventListener('submit', this.#formSubmitHandler);
    if (resetButton.innerHTML === 'Cancel') {
      this.element.querySelector('.event__reset-btn').addEventListener('click', this.#handleCancelClick);
    }
    if (resetButton.innerHTML === 'Delete') {
      this.element.querySelector('.event__reset-btn').addEventListener('click', this.#deleteClickHandler);
    }
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#editClickHandler);
  }

  #eventTypeChangeHandler = (evt) => {
    const newType = evt.target.value;
    const newOffersByType = this.#offers.find((offer) => offer.type.toLowerCase() === newType.toLowerCase())?.offers ?? [];

    this.updateElement({
      type: newType,
      offers: newOffersByType.filter((offer) => offer.checked),
    });
  };

  #destinationChangeHandler = (evt) => {
    const selectedDestination = this.#destinations.find((dest) => dest.name === evt.target.value);

    if (selectedDestination) {
      this.updateElement({ destination: selectedDestination.id });
      return;
    }

    evt.target.value = '';
  };

  #setDatepickers() {
    const startInput = this.element.querySelector('#event-start-time-1');
    const endInput = this.element.querySelector('#event-end-time-1');

    if (this.#datepickerStart) {
      this.#datepickerStart.destroy();
    }
    if (this.#datepickerEnd) {
      this.#datepickerEnd.destroy();
    }

    this.#datepickerStart = flatpickr(startInput, {
      enableTime: true,
      dateFormat: 'd/m/y H:i',
      defaultDate: this._state.dateFrom,
      onChange: this.#dateFromChangeHandler,
      maxDate: this._state.dateTo,
    });

    this.#datepickerEnd = flatpickr(endInput, {
      enableTime: true,
      dateFormat: 'd/m/y H:i',
      defaultDate: this._state.dateTo,
      minDate: this._state.dateFrom,
      onChange: this.#dateToChangeHandler,
    });
  }

  #dateFromChangeHandler = ([userDate]) => {
    this.updateElement({ dateFrom: userDate });
    this.#datepickerEnd.set('minDate', userDate);
    if (new Date(this._state.dateTo) < userDate) {
      this.updateElement({ dateTo: userDate });
      this.#datepickerEnd.setDate(userDate);
    }
  };

  #dateToChangeHandler = ([userDate]) => {
    if (new Date(userDate) < new Date(this._state.dateFrom)) {
      this.#datepickerEnd.setDate(this._state.dateFrom);
      this.updateElement({ dateTo: this._state.dateFrom });
      return;
    }

    this.updateElement({ dateTo: userDate });
  };

  #priceChangeHandler = (evt) => {
    evt.target.value = evt.target.value.replace(/\D/g, '');
    this._setState({ basePrice: Number(evt.target.value) || 0 });
  };

  #offersChangeHandler = (evt) => {
    const offerId = evt.target.id;
    const checked = evt.target.checked;

    this.updateElement({
      offers: checked
        ? [...this._state.offers, offerId]
        : this._state.offers.filter((id) => id !== offerId),
    });
  };

  unlockForm() {
    const saveButton = this.element.querySelector('.event__save-btn');
    const resetButton = this.element.querySelector('.event__reset-btn');
    saveButton.disabled = false;
    resetButton.disabled = false;
    const formElements = this.element.querySelectorAll('input, select, textarea, button, .event__offer-checkbox');
    formElements.forEach((element) => {
      element.disabled = false;
    });
    this.element.querySelector('.event--edit').classList.remove('loading');
  }

  #shakeForm() {
    const formElement = this.element.querySelector('.event--edit');
    formElement.classList.remove('shake');
    formElement.classList.add('shake');
  }

  #formSubmitHandler = async (evt) => {
    evt.preventDefault();
    const saveButton = this.element.querySelector('.event__save-btn');
    const resetButton = this.element.querySelector('.event__reset-btn');
    saveButton.textContent = 'Saving...';
    saveButton.disabled = true;
    resetButton.disabled = true;
    const formElements = this.element.querySelectorAll('input, select, textarea, button, .event__offer-checkbox');
    formElements.forEach((element) => {
      element.disabled = true;
    });

    const selectedOffers = this._state.offers;
    const updatedEvent = {
      ...EventEditFormView.parseStateToEvent(this._state, this.#offers || []),
      ...(this._state.id && { id: this._state.id }),
      offers: selectedOffers,
    };
    if (updatedEvent.id === undefined) {
      delete updatedEvent.id;
    }

    try {
      const response = await this.#handleFormSubmit(updatedEvent);

      if (!response.ok || !response.status.toString().startsWith('2')) {
        throw new Error(`Ошибка от сервера: ${response.statusText || 'Неизвестная ошибка'}`);
      }

      this.unlockForm();
    } catch (error) {
      this.#shakeForm();
      this.unlockForm();
    }
  };

  #handleCancelClick = (evt) => {
    evt.preventDefault();
    this.#handleEditClick(EventEditFormView.parseStateToEvent(this._state));
  };

  #deleteClickHandler = async (evt) => {
    evt.preventDefault();
    const resetButton = this.element.querySelector('.event__reset-btn');
    const saveButton = this.element.querySelector('.event__save-btn');

    if (resetButton.innerHTML === 'Delete') {
      resetButton.textContent = 'Deleting...';
      resetButton.disabled = true;
      saveButton.disabled = true;
      const formElements = this.element.querySelectorAll('input, select, textarea, button, .event__offer-checkbox');
      formElements.forEach((element) => {
        element.disabled = true;
      });
    }

    try {
      await this.#handleDeleteClick(this._state.id);
      this.unlockForm();
    } catch (error) {
      this.#shakeForm();
      this.unlockForm();
    }
  };

  #editClickHandler = (evt) => {
    evt.preventDefault();
    this.updateElement({ offers: this._state.offers });
    this.#handleEditClick();
  };

  static parseEventToState(event) {
    return {
      ...event,
      basePrice: event.basePrice ?? 0,
      offers: event.offers ?? [],
    };
  }

  static parseStateToEvent(state, offers = []) {
    return {
      ...state,
      basePrice: Number(state.basePrice) || 0,
      offers: state.offers.map((offerId) => {
        const parsedOffer = offers.find((offer) => offer.id === offerId);
        return parsedOffer ? { id: parsedOffer.id, title: parsedOffer.title, price: parsedOffer.price } : null;
      }).filter(Boolean),
    };
  }
}
