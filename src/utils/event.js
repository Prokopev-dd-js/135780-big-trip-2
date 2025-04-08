import dayjs from 'dayjs';

const TIME_FORMAT = 'HH:mm';
const HOURS_IN_DAY = 24;
const MINUTES_IN_HOURS = 60;

function humanizeDate(eventDate, dateFormat) {
  const date = eventDate ? dayjs(eventDate).format(dateFormat) : '';
  const time = eventDate ? dayjs(eventDate).format(TIME_FORMAT) : '';
  return {
    date: date,
    time: time
  };
}

function eventDuration(startTime, endTime) {
  const duration = dayjs(endTime).diff(dayjs(startTime), 'minutes');
  const durationDays = Math.floor(duration / (HOURS_IN_DAY * MINUTES_IN_HOURS));
  const durationHours = Math.floor((duration - durationDays * HOURS_IN_DAY * MINUTES_IN_HOURS) / MINUTES_IN_HOURS);
  const durationMinutes = duration - durationDays * HOURS_IN_DAY * MINUTES_IN_HOURS - durationHours * MINUTES_IN_HOURS;

  const formattedDays = durationDays ? `${String(durationDays).padStart(2, '0')}D` : '';
  const formattedHours = durationDays || durationHours ? `${String(durationHours).padStart(2, '0')}H` : '';
  const formattedMinutes = durationDays || durationHours || durationMinutes
    ? `${String(durationMinutes).padStart(2, '0')}M`
    : '00M';

  return { days: formattedDays, hours: formattedHours, minutes: formattedMinutes };
}

function isEventFavorite(isFavourite) {
  return isFavourite && 'event__favorite-btn--active';
}

function updateItem(items, update) {
  return items.map((item) => item.id === update.id ? update : item);
}

export { humanizeDate, eventDuration, isEventFavorite, updateItem };
