import AbstractStatefulView from '../../framework/view/abstract-stateful-view.js';
import { createEventEditFormTemplate } from './event-edit-form-view-template.js';
import { EVENT_TYPES } from '../../const.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

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

  static parseEventToState(event) {
    return {
      ...event,
      basePrice: event.basePrice ?? 0,
      isSaving: false,
      isDeleting: false,
    };
  }

  static parseStateToEvent(state) {
    return {
      ...state,
      basePrice: Number(state.basePrice) || 0,
      offers: state.offers.map((offer) => ({ id: offer.id, title: offer.title, price: offer.price })),
    };
  }

  get template() {
    return createEventEditFormTemplate(this._state, this.#destinations, this.#offers);
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

  // Методы для блокировки интерфейса и показа лоадера
  setSaving() {
    this.updateElement({ isSaving: true });
  }

  setDeleting() {
    this.updateElement({ isDeleting: true });
  }

  resetState() {
    this.updateElement({ isSaving: false, isDeleting: false });
  }

  shake() {
    this.element.classList.add('shake');
    setTimeout(() => {
      this.element.classList.remove('shake');
    }, 600);
  }

  _restoreHandlers() {
    const resetButton = this.element.querySelector('.event__reset-btn');
    this.element.querySelector('.event__type-group').addEventListener('change', this.#eventTypeChangeHandler);
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#destinationChangeHandler);
    this.#setDatepickers();
    this.element.querySelector('.event__input--price').addEventListener('input', this.#priceChangeHandler);
    this.element.querySelectorAll('.event__offer-checkbox').forEach((checkbox) =>
      checkbox.addEventListener('change', this.#offersChangeHandler)
    );
    this.element.querySelector('.event--edit').addEventListener('submit', this.#formSubmitHandler);

    if (this.#handleDeleteClick) {
      resetButton.addEventListener('click', this.#deleteClickHandler);
    } else {
      resetButton.addEventListener('click', this.#handleCancelClick);
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
      // Сохраняем весь объект направления
      this.updateElement({ destination: selectedDestination });
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
    if (!userDate) {
      return;
    }
    this.updateElement({ dateFrom: userDate });
    this.#datepickerEnd.set('minDate', userDate);
    if (new Date(this._state.dateTo) < userDate) {
      this.updateElement({ dateTo: userDate });
      this.#datepickerEnd.setDate(userDate);
    }
  };

  #dateToChangeHandler = ([userDate]) => {
    if (!userDate) {
      return;
    }
    if (new Date(userDate) < new Date(this._state.dateFrom)) {
      this.#datepickerEnd.setDate(this._state.dateFrom);
      this.updateElement({ dateTo: this._state.dateFrom });
      return;
    }
    this.updateElement({ dateTo: userDate });
  };

  #priceChangeHandler = (evt) => {
    evt.target.value = evt.target.value.replace(/\D/g, '');
    const price = Number(evt.target.value) || 0;
    this._setState({ basePrice: price });
  };

  #offersChangeHandler = (evt) => {
    const offerId = evt.target.dataset.offerId;
    this._setState({
      offers: this._state.offers.map((offer) =>
        offer.id === offerId ? { ...offer, checked: evt.target.checked } : offer
      ),
    });
  };

  #formSubmitHandler = async (evt) => {
    evt.preventDefault();
    this.setSaving(); // Устанавливаем состояние "Saving..."

    const selectedOffers = Array.from(this.element.querySelectorAll('.event__offer-checkbox:checked')).map((input) => {
      const offerType = this.#offers.find((offer) => offer.type === this._state.type);
      return offerType ? offerType.offers.find((offer) => offer.id === input.id) : null;
    }).filter(Boolean);

    const updatedEvent = {
      ...EventEditFormView.parseStateToEvent(this._state),
      offers: selectedOffers,
    };

    let isSuccess = false;
    try {
      await this.#handleFormSubmit(updatedEvent);
      isSuccess = true;
      // Закрываем форму только при успешном сохранении
      // eslint-disable-next-line no-unused-expressions
      this._callback.closeForm && this._callback.closeForm(); // По другому не придумал как реализовать покачивание
    } catch (error) {
      this.shake();
      // Ждем, пока анимация завершится
      await new Promise((resolve) => setTimeout(resolve, 600));
      // eslint-disable-next-line no-console
      console.error('Error during save:', error);
    } finally {
      // Если сохранение прошло успешно, сбрасываем состояние, иначе сбрасываем блокировку
      if (isSuccess) {
        this.resetState();
      } else {
        this.updateElement({ isSaving: false });
      }
    }
  };


  #handleCancelClick = (evt) => {
    evt.preventDefault();
    this.#handleEditClick(EventEditFormView.parseStateToEvent(this._state));
  };

  #deleteClickHandler = async (evt) => {
    evt.preventDefault();
    if (!this.#handleDeleteClick) {
      return;
    }
    this.setDeleting();
    // Задержка для отображения "Deleting..."
    await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      await this.#handleDeleteClick();
    } catch (error) {
      this.shake();
      // Ждем, пока анимация завершится
      await new Promise((resolve) => setTimeout(resolve, 600));
      // eslint-disable-next-line no-console
      console.error('Error during delete:', error);
    } finally {
      this.resetState();
    }
  };

  #editClickHandler = (evt) => {
    evt.preventDefault();
    this.updateElement({ offers: this._state.offers });
    this.#handleEditClick();
  };
}

