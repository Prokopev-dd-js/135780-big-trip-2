import { render, remove, RenderPosition } from '../framework/render.js';
import EventEditFormView from '../view/event-edit-form-view/event-edit-form-view.js';
import { EVENT_TYPES } from '../const.js';

export default class NewEventPresenter {
  #events = null;
  #destinations = [];
  #offers = [];
  #onDataChange = null;
  #onCloseForm = null;
  #eventEditFormComponent = null;
  #escKeyListener = null;
  #isFormOpen = false;

  constructor({ eventsModel, destinationsModel, offersModel, onDataChange, onCloseForm }) {
    this.#events = eventsModel;
    this.#destinations = destinationsModel.destinations;
    this.#offers = offersModel.offers;
    this.#onDataChange = onDataChange;
    this.#onCloseForm = onCloseForm;
  }

  init() {
    if (this.#isFormOpen) {
      return;
    }

    this.#isFormOpen = true;

    const defaultType = EVENT_TYPES[5];
    const defaultOffers = this.#offers.find((offer) => offer.type === defaultType)?.offers || [];

    this.#eventEditFormComponent = new EventEditFormView({
      event: {
        type: defaultType,
        destination: '',
        dateFrom: '',
        dateTo: '',
        basePrice: 0,
        offers: defaultOffers,
        isFavorite: false,
      },
      destinations: this.#destinations,
      offers: this.#offers,
      onFormSubmit: this.#formSubmitHandler,
      onEditClick: this.#handleCloseFormClick,
    });

    render(this.#eventEditFormComponent, document.querySelector('.trip-events__list'), RenderPosition.AFTERBEGIN);
    this.#addEscKeyListener();
  }

  #formSubmitHandler = async (newEvent) => {
    try {
      await this.#events.addEvent(newEvent);

      this.#onCloseForm();
      this.destroy();
    } catch (error) {
      this.#eventEditFormComponent.unlockForm();
      this.#eventEditFormComponent.shakeForm();
    }
  };

  #handleCloseFormClick = () => {
    this.#onCloseForm();
    this.destroy();
  };

  destroy() {
    if (this.#eventEditFormComponent) {
      remove(this.#eventEditFormComponent);
      this.#eventEditFormComponent = null;
    }

    this.#removeEscKeyListener();
    this.#isFormOpen = false;
  }

  #addEscKeyListener() {
    this.#escKeyListener = (evt) => {
      if (evt.key === 'Escape') {
        evt.preventDefault();
        this.#handleCloseFormClick();
      }
    };

    document.addEventListener('keydown', this.#escKeyListener);
  }

  #removeEscKeyListener() {
    if (this.#escKeyListener) {
      document.removeEventListener('keydown', this.#escKeyListener);
      this.#escKeyListener = null;
    }
  }
}
