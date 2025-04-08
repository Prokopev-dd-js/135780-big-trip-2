import AbstractView from '../framework/view/abstract-view';

function createSortItemTemplate(sort, currentSortType) {
  const { type } = sort;
  const isChecked = type === currentSortType;

  return (
    `<div class="trip-sort__item trip-sort__item--${type}">
      <input
        id="sort-${type}"
        class="trip-sort__input visually-hidden"
        type="radio"
        name="trip-sort"
        value="sort-${type}"
        ${isChecked ? 'checked' : ''}
        data-sort-type="${type}"
        ${((type === 'event') || (type === 'offers')) ? 'disabled' : ''}>
      <label class="trip-sort__btn" for="sort-${type}" data-sort-type="${type}">${type}</label>
    </div>`
  );
}

function createSortTemplate(sortItems, currentSortType) {
  const sortItemsTemplate = sortItems
    .map((sort) => createSortItemTemplate(sort, currentSortType))
    .join('');

  return (
    `<form class="trip-events__trip-sort trip-sort" action="#" method="get">
      ${sortItemsTemplate}
    </form>`
  );
}

export default class SortView extends AbstractView {
  #sorts = null;
  #currentSortType = null;
  #onSortChange = null;

  constructor({ sorts, currentSortType, onSortChange }) {
    super();
    this.#sorts = sorts;
    this.#currentSortType = currentSortType;
    this.#onSortChange = onSortChange;

    this.element.addEventListener('click', this.#handleSortClick);
  }

  get template() {
    return createSortTemplate(this.#sorts, this.#currentSortType);
  }

  #handleSortClick = (evt) => {
    const sortType = evt.target.dataset.sortType;

    if (!sortType || sortType === this.#currentSortType || sortType === 'event' || sortType === 'offers') {
      return;
    }

    this.#currentSortType = sortType;
    this.#onSortChange(sortType);
    this.updateElement({ currentSortType: this.#currentSortType });
  };

  updateElement({ currentSortType }) {
    this.#currentSortType = currentSortType;

    const parent = this.element.parentElement;
    if (!parent) {
      return;
    }

    const newSortView = new SortView({
      sorts: this.#sorts,
      currentSortType: this.#currentSortType,
      onSortChange: this.#onSortChange
    });

    parent.replaceChild(newSortView.element, this.element);
  }
}
