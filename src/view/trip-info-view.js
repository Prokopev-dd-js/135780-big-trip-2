import AbstractView from '../framework/view/abstract-view';
import { humanizeDate } from '../utils/event';

const EVENT_DATE_FORMAT = 'DD MMM';

function createTripInfoTemplate(events, destinations, offers, totalCost) {
  if (!events.length) {
    return '';
  }

  const destinationNames = events.map((event) => {
    const destinationObj = destinations.find((dest) => dest.id === event.destination);
    return destinationObj ? destinationObj.name : '';
  });

  const tripInfoTitle =
    destinationNames.length > 3
      ? `${destinationNames[0]} &mdash; ... &mdash; ${destinationNames[destinationNames.length - 1]}`
      : destinationNames.join(' &mdash; ');

  const tripStartTime = Math.min(...events.map((event) => event.dateFrom));
  const tripEndTime = Math.max(...events.map((event) => event.dateTo));

  return (
    `<section class="trip-main__trip-info trip-info">
      <div class="trip-info__main">
        <h1 class="trip-info__title">${tripInfoTitle}</h1>
        <p class="trip-info__dates">
          ${humanizeDate(tripStartTime, EVENT_DATE_FORMAT).date}&nbsp;&mdash;&nbsp;
          ${humanizeDate(tripEndTime, EVENT_DATE_FORMAT).date}
        </p>
      </div>
      <p class="trip-info__cost">
        Total: &euro;&nbsp;<span class="trip-info__cost-value">${totalCost}</span>
      </p>
    </section>`
  );
}

export default class TripInfoView extends AbstractView {
  #events;
  #destinations;
  #offers;
  #totalCost;

  constructor({ events, destinations, offers, totalCost = 0 }) {
    super();
    this.#events = events;
    this.#destinations = destinations;
    this.#offers = offers;
    this.#totalCost = totalCost;
  }

  get template() {
    return createTripInfoTemplate(this.#events, this.#destinations, this.#offers, this.#totalCost);
  }

  updateTotalCost(totalCost) {
    this.#totalCost = totalCost;
    const costElement = this.element.querySelector('.trip-info__cost-value');
    if (costElement) {
      costElement.textContent = totalCost;
    }
  }
}
