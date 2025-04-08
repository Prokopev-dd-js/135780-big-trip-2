import Observable from '../framework/observable.js';
import EventApiService from '../event-api-service.js';
import { UpdateType } from '../const.js';

export default class OffersModel extends Observable {
  #apiService = new EventApiService();
  #offers = [];

  async init() {
    try {
      this.#offers = await this.#apiService.getOffers();
      this._notify(UpdateType.INIT);
    } catch (err) {
      throw new Error('Ошибка загрузки списка дополнительных опций');
    }
  }

  get offers() {
    return this.#offers;
  }

  getOffersByType(type) {
    return this.#offers.find((offer) => offer.type === type)?.offers || [];
  }
}
