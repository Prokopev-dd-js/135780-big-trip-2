import { UpdateType } from '../const.js';
import Observable from '../framework/observable.js';
import EventApiService from '../event-api-service.js';

export default class EventsModel extends Observable {
  #apiService = new EventApiService();
  #events = [];

  async init() {
    try {
      this.#events = await this.#apiService.getEvents();
      this._notify(UpdateType.INIT);
    } catch (error) {
      this.#events = [];
      throw new Error('Ошибка загрузки точек марщрута');
    }
  }

  get events() {
    return this.#events;
  }

  async updateEvent(event) {
    try {
      const updatedEvent = await this.#apiService.updateEvent(event);
      const index = this.#events.findIndex((e) => e.id === updatedEvent.id);
      if (index !== -1) {
        this.#events[index] = updatedEvent;
        this._notify(UpdateType.PATCH, updatedEvent);
      }
      return updatedEvent;
    } catch (err) {
      return err;
    }
  }

  async addEvent(newEvent) {
    try {
      const addedEvent = await this.#apiService.addEvent(newEvent);
      this.#events = [addedEvent, ...this.#events];
      this._notify(UpdateType.POST, addedEvent);
    } catch (err) {
      throw new Error('Ошибка добавления новой точки маршрута');
    }
  }

  async deleteEvent(eventId) {
    try {
      await this.#apiService.deleteEvent(eventId);
      this.#events = this.#events.filter((event) => event.id !== eventId);
      this._notify(UpdateType.PATCH, eventId);
    } catch (err) {
      throw new Error('Ошибка удаления точки маршрута');
    }
  }
}
