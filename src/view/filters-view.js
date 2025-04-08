import AbstractView from '../framework/view/abstract-view.js';

function applyFilter(events, filterType) {
  const now = new Date();

  return events.filter((event) => (
    {
      future: event.dateFrom > now,
      present: event.dateFrom <= now && event.dateTo >= now,
      past: event.dateTo < now,
    }[filterType] ?? true
  ));
}

function createFilterItemTemplate(filter, currentFilterType, events) {
  const { type } = filter;
  const isChecked = type === currentFilterType ? 'checked' : '';
  const isDisabled = applyFilter(events, type).length === 0 ? 'disabled' : '';

  return (
    `<div class="trip-filters__filter">
      <input id="filter-${type}" class="trip-filters__filter-input visually-hidden"
        type="radio" name="trip-filter" value="${type}"
        ${isChecked} ${isDisabled}>
      <label class="trip-filters__filter-label" for="filter-${type}">${type}</label>
    </div>`
  );
}

function createFiltersTemplate(filters, currentFilterType, events) {
  const filterItemsTemplate = filters
    .map((filter) => createFilterItemTemplate(filter, currentFilterType, events))
    .join('');

  return (
    `<form class="trip-filters" action="#" method="get">
      ${filterItemsTemplate}
      <button class="visually-hidden" type="submit">Accept filter</button>
    </form>`
  );
}

export default class FiltersView extends AbstractView {
  #filters = null;
  #currentFilterType = null;
  #onFilterChange = null;
  #events = null;

  constructor({ filters, currentFilterType, onFilterChange, events }) {
    super();
    this.#filters = filters;
    this.#currentFilterType = currentFilterType;
    this.#onFilterChange = onFilterChange;
    this.#events = events;

    this.element.addEventListener('change', this.#handleFilterChange);
  }

  get template() {
    return createFiltersTemplate(this.#filters, this.#currentFilterType, this.#events);
  }

  #handleFilterChange = (evt) => {
    const selectedFilter = evt.target.value;

    if (!selectedFilter || selectedFilter === this.#currentFilterType) {
      return;
    }

    this.#onFilterChange(selectedFilter);
  };
}
