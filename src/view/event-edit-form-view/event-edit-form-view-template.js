import { humanizeDate } from '../../utils/event';

const EDIT_FORM_DATE_FORMAT = 'DD/MM/YY';

function createEventDestinationsList(destinations) {
  return destinations.map((destination) =>
    `<option value=${destination.name}></option>`
  ).join('');
}

function createOffersTemplate(offers, selectedOffers) {
  return offers.map((offer) => {
    const isChecked = selectedOffers.some((selectedOffer) => selectedOffer.id === offer.id);
    return `
      <div class="event__offer-selector">
        <input class="event__offer-checkbox visually-hidden"
          id="${offer.id}"
          type="checkbox"
          name="${offer.title}"
          ${isChecked ? 'checked' : ''}>
        <label class="event__offer-label" for="${offer.id}">
          <span class="event__offer-title">${offer.title}</span>
          &plus;&euro;&nbsp;
          <span class="event__offer-price">${offer.price}</span>
        </label>
      </div>`;
  }).join('');
}

function createOffersContainerTemplate(offersByType, selectedOffers) {
  return offersByType.length ? (
    `<section class="event__section event__section--offers">
      <h3 class="event__section-title event__section-title--offers">Offers</h3>
      <div class="event__available-offers">
        ${createOffersTemplate(offersByType, selectedOffers)}
      </div>
    </section>`
  ) : '';
}

function createDestinationPhotoTemplate(destinationById) {
  return destinationById.pictures.map((picture) =>
    `<img class="event__photo" src="${picture.src}" alt="${picture.description}">`
  ).join('');
}

function createEventEditFormTemplate(event, destinations, offersList) {
  const {basePrice, dateFrom, dateTo, destination, offers, type} = event;
  const startTime = `${humanizeDate(dateFrom, EDIT_FORM_DATE_FORMAT).date} ${humanizeDate(dateFrom).time}`;
  const endTime = humanizeDate(dateTo, EDIT_FORM_DATE_FORMAT).date + humanizeDate(dateTo).time;
  const destinationById = destinations.find((dest) => dest.id === destination);
  const offersByType = offersList.find((offer) => offer.type.toLowerCase() === type.toLowerCase())?.offers ?? [];
  const selectedOffers = offersByType.filter((offer) => offers.includes(offer.id));
  const hasPictures = destinationById?.pictures?.length > 0;
  const hasDescription = destinationById?.description?.trim() !== '';
  const showDestinationSection = hasPictures || hasDescription;

  return (
    `<li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type  event__type-btn" for="event-type-toggle-1">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">

            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>

                <div class="event__type-item">
                  <input id="event-type-taxi-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="taxi">
                  <label class="event__type-label  event__type-label--taxi" for="event-type-taxi-1">Taxi</label>
                </div>

                <div class="event__type-item">
                  <input id="event-type-bus-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="bus">
                  <label class="event__type-label  event__type-label--bus" for="event-type-bus-1">Bus</label>
                </div>

                <div class="event__type-item">
                  <input id="event-type-train-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="train">
                  <label class="event__type-label  event__type-label--train" for="event-type-train-1">Train</label>
                </div>

                <div class="event__type-item">
                  <input id="event-type-ship-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="ship">
                  <label class="event__type-label  event__type-label--ship" for="event-type-ship-1">Ship</label>
                </div>

                <div class="event__type-item">
                  <input id="event-type-drive-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="drive">
                  <label class="event__type-label  event__type-label--drive" for="event-type-drive-1">Drive</label>
                </div>

                <div class="event__type-item">
                  <input id="event-type-flight-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="flight">
                  <label class="event__type-label  event__type-label--flight" for="event-type-flight-1">Flight</label>
                </div>

                <div class="event__type-item">
                  <input id="event-type-check-in-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="check-in">
                  <label class="event__type-label  event__type-label--check-in" for="event-type-check-in-1">Check-in</label>
                </div>

                <div class="event__type-item">
                  <input id="event-type-sightseeing-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="sightseeing">
                  <label class="event__type-label  event__type-label--sightseeing" for="event-type-sightseeing-1">Sightseeing</label>
                </div>

                <div class="event__type-item">
                  <input id="event-type-restaurant-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="restaurant">
                  <label class="event__type-label  event__type-label--restaurant" for="event-type-restaurant-1">Restaurant</label>
                </div>
              </fieldset>
            </div>
          </div>

          <div class="event__field-group  event__field-group--destination">
            <label class="event__label  event__type-output" for="event-destination-1">
              ${type}
            </label>
            <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${destination ? destinationById.name : ''}" list="destination-list-1"  required>
            <datalist id="destination-list-1">
              ${createEventDestinationsList(destinations)}
            </datalist>
          </div>

          <div class="event__field-group  event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${startTime}">
            &mdash;
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${endTime}">
          </div>

          <div class="event__field-group  event__field-group--price">
            <label class="event__label" for="event-price-1">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input class="event__input  event__input--price" id="event-price-1" type="number" name="event-price" value="${basePrice}" min="1">
          </div>

          <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">Delete</button>
          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
          </button>
        </header>
        <section class="event__details">
        ${createOffersContainerTemplate(offersByType, selectedOffers)}

        ${destination && showDestinationSection ? `
        <section class="event__section  event__section--destination">
          <h3 class="event__section-title  event__section-title--destination">Destination</h3>
          ${hasDescription ? `<p class="event__destination-description">${destinationById.description}</p>` : ''}

          ${hasPictures ? `
            <div class="event__photos-container">
              <div class="event__photos-tape">
                ${createDestinationPhotoTemplate(destinationById)}
              </div>
            </div>
          ` : ''}
        </section>
      ` : ''}
      </section>
      </form>
    </li>`
  );
}

export { createEventEditFormTemplate };
