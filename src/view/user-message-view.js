import AbstractView from '../framework/view/abstract-view';
import { NoEventMessages } from '../const';

function createMessageTemplate(filterType) {
  const message = NoEventMessages[filterType] || NoEventMessages.everything;
  return (
    `<p class="trip-events__msg">${message}</p>`
  );
}

export default class UserMessageView extends AbstractView {
  #filterType;

  constructor(filterType = 'everything') {
    super();
    this.#filterType = filterType;
  }

  get template() {
    return createMessageTemplate(this.#filterType);
  }
}
