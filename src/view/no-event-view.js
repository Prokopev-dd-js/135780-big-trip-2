import { NoEventMessages } from '../const.js';
import AbstractView from '../framework/view/abstract-view.js';

export default class NoEventView extends AbstractView {
  #filterType = null;

  constructor(filterType) {
    super();
    this.#filterType = filterType;
  }

  get template() {
    return `<p class="trip-events__msg">${NoEventMessages[this.#filterType]}</p>`;
  }
}
