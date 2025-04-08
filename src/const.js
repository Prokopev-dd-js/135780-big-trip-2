const EVENT_TYPES = ['Taxi', 'Bus', 'Train', 'Ship', 'Drive', 'Flight', 'Check-in', 'Sightseeing', 'Restaurant'];
const DESTINATIONS = ['London', 'Manchester', 'Edinburgh', 'Birmingham', 'Liverpool', 'Paris', 'Tokyo', 'New York', 'Berlin'];

const OFFERS = [
  'Add luggage',
  'Switch to comfort class',
  'Add meal',
  'Choose seats',
  'Travel by train',
  'Order Uber',
  'Rent a car',
  'Add breakfast',
  'Book tickets',
  'Lunch in city'];

const DESCRIPTIONS = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  'Cras aliquet varius magna, non porta ligula feugiat eget.',
  'Fusce tristique felis at fermentum pharetra.',
  'Aliquam id orci ut lectus varius viverra.',
  'Nullam nunc ex, convallis sed finibus eget, sollicitudin eget ante.',
  'Phasellus eros mauris, condimentum sed nibh vitae, sodales efficitur ipsum.',
  'Sed blandit, eros vel aliquam faucibus, purus ex euismod diam, eu luctus nunc ante ut dui.',
  'Sed sed nisi sed augue convallis suscipit in sed felis.',
  'Aliquam erat volutpat. Nunc fermentum tortor ac porta dapibus.',
  'In rutrum ac purus sit amet tempus.'
];

const NoEventMessages = {
  loading: 'Loading...',
  everything: 'Click New Event to create your first point',
  past: 'There are no past events now',
  present: 'There are no present events now',
  future: 'There are no future events now',
};

const PICTURE_URL = 'https://loremflickr.com/248/152?random=';

const FILTERS = [
  {
    type: 'everything',
    filter: (events) => events.filter((event) => event),
    isChecked: true,
  },
  {
    type: 'future',
    filter: (events) => events.filter((event) => event.dateTo > new Date()),
    isChecked: false,
  },
  {
    type: 'present',
    filter: (events) => events.filter((event) => event.dateTo > new Date() && event.dateFrom < new Date()),
    isChecked: false,
  },
  {
    type: 'past',
    filter: (events) => events.filter((event) => event.dateFrom < new Date()),
    isChecked: false,
  },
];

const SORTS = [
  {
    type: 'day',
    sort: (a, b) => new Date(a.dateFrom) - new Date(b.dateFrom),
    isChecked: true,
  },
  {
    type: 'event',
    sort: (events) => events.sort((event1, event2) => event1.destination.localeCompare(event2.destination)),
    isChecked: false,
  },
  {
    type: 'time',
    sort: (a, b) => (b.dateTo - b.dateFrom) - (a.dateTo - a.dateFrom),
    isChecked: false,
  },
  {
    type: 'price',
    sort: (a, b) => b.basePrice - a.basePrice,
    isChecked: false,
  },
  {
    type: 'offers',
    sort: (events) => events.sort((event1, event2) => event2.offers.length - event1.offers.length),
    isChecked: false,
  },
];

const UserAction = {
  UPDATE_EVENT: 'UPDATE_EVENT',
  ADD_EVENT: 'ADD_EVENT',
  DELETE_EVENT: 'DELETE_EVENT',
};

const UpdateType = {
  PATCH: 'PATCH',
  MINOR: 'MINOR',
  MAJOR: 'MAJOR',
};


export { EVENT_TYPES, OFFERS, DESTINATIONS, DESCRIPTIONS, PICTURE_URL, FILTERS, SORTS, UserAction, UpdateType, NoEventMessages };
