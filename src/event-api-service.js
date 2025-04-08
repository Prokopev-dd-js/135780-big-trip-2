import ApiService from './framework/api-service';

const Method = {
  GET: 'GET',
  PUT: 'PUT',
  POST: 'POST',
  DELETE: 'DELETE',
};

export default class EventApiService extends ApiService {
  constructor() {
    super('https://23.objects.htmlacademy.pro/big-trip', 'Basic eo0w590ik29889a');
  }

  async getEvents() {
    const response = await this._load({ url: 'points' });
    return this._adaptPointsData(await ApiService.parseResponse(response));
  }

  async getDestinations() {
    const response = await this._load({ url: 'destinations' });
    return this._adaptDestinationsData(await ApiService.parseResponse(response));
  }

  async getOffers() {
    const response = await this._load({ url: 'offers' });
    return this._adaptOffersData(await ApiService.parseResponse(response));
  }

  async updateEvent(event) {
    const adaptedEvent = this._adaptEventForServer(event);
    const response = await this._load({
      url: `points/${event.id}`,
      method: Method.PUT,
      body: JSON.stringify(adaptedEvent),
      headers: new Headers({'Content-Type': 'application/json'})
    });

    const updatedData = await ApiService.parseResponse(response);
    return this._adaptPointsData([updatedData])[0];
  }

  async addEvent(event) {
    const adaptedEvent = this._adaptEventForServer(event);
    const response = await this._load({
      url: 'points',
      method: 'POST',
      body: JSON.stringify(adaptedEvent),
      headers: new Headers({ 'Content-Type': 'application/json' })
    });

    const newEventData = await ApiService.parseResponse(response);
    return this._adaptPointsData([newEventData])[0];
  }

  async deleteEvent(eventId) {
    await this._load({
      url: `points/${eventId}`,
      method: Method.DELETE,
    });
  }

  _adaptEventForServer(event) {
    return {
      id: event.id,
      type: event.type.toLowerCase(),
      ['base_price']: event.basePrice,
      ['date_from']: event.dateFrom.toISOString(),
      ['date_to']: event.dateTo.toISOString(),
      destination: event.destination,
      offers: Array.isArray(event.offers) ? event.offers : event.offers.map((offer) => offer.id),
      ['is_favorite']: event.isFavorite ?? false,
    };
  }

  _adaptPointsData(points) {
    return points.map((point) => ({
      id: point.id,
      type: point.type,
      dateFrom: new Date(point.date_from),
      dateTo: new Date(point.date_to),
      basePrice: point.base_price,
      destination: point.destination,
      offers: point.offers,
      isFavorite: point.is_favorite,
    }));
  }

  _adaptDestinationsData(destinations) {
    return destinations.map((destination) => ({
      id: destination.id,
      name: destination.name,
      description: destination.description,
      pictures: destination.pictures,
    }));
  }

  _adaptOffersData(offers) {
    return offers.map((offer) => ({
      type: offer.type,
      offers: offer.offers.map((offerItem) => ({
        id: offerItem.id,
        title: offerItem.title,
        price: offerItem.price,
        isChecked: offerItem.isChecked || false,
      })),
    }));
  }
}
