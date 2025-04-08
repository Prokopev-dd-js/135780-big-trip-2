
import AbstractView from '../framework/view/abstract-view';
import { humanizeDate } from '../utils/event';

const EVENT_DATE_FORMAT = 'DD MMM';

function createTripInfoTemplate(events, destinations, offersByType) {
  if (!events.length) {
    return '';
  }

  const destinationNames = events
    .map((event) => destinations.find((dest) => dest.id === event.destination)?.name)
    .filter((name, index, self) => name && self.indexOf(name) === index);

  const tripInfoTitle =
    destinationNames.length > 3
      ? `${destinationNames[0]} &mdash;...&mdash; ${destinationNames[destinationNames.length - 1]}`
      : destinationNames.join(' &mdash; ');

  const tripStartTime = Math.min(...events.map((event) => event.dateFrom));
  const tripEndTime = Math.max(...events.map((event) => event.dateTo));

  const totalCost = events.reduce((sum, event) => {
    let eventCost = event.basePrice;

    const availableOffers = offersByType.find((offerGroup) => offerGroup.type === event.type)?.offers || [];

    const selectedOffersCost = event.offers.reduce((offerSum, offerId) => {
      const offer = availableOffers.find((item) => item.id === offerId);
      return offer ? offerSum + offer.price : offerSum;
    }, 0);

    eventCost += selectedOffersCost;
    return sum + eventCost;
  }, 0);

  return (
    `<section class="trip-main__trip-info  trip-info">
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

  constructor(events, destinations, offers) {
    super();
    this.#events = events;
    this.#destinations = destinations;
    this.#offers = offers;
  }

  get template() {
    return createTripInfoTemplate(this.#events, this.#destinations, this.#offers);
  }
}
