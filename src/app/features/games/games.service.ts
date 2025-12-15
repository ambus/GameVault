import { Injectable } from '@angular/core';
import { delay, of } from 'rxjs';
import { Game } from './games.types';

@Injectable({ providedIn: 'root' })
export class GamesService {
  private readonly mock: Game[] = [
    {
      id: '1',
      name: 'The Witcher 3',
      genre: 'RPG',
      platform: 'PC',
      releaseDate: '2015-05-19',
      rating: 9.5,
      description: 'Epic RPG'
    }
  ];

  list() {
    return of(this.mock).pipe(delay(300));
  }

  get(id: string) {
    return of(this.mock.find((g) => g.id === id) ?? null).pipe(delay(200));
  }

  create(game: Game) {
    const id = crypto.randomUUID();
    this.mock.push({ ...game, id });
    return of(true).pipe(delay(200));
  }

  update(id: string, game: Game) {
    const idx = this.mock.findIndex((g) => g.id === id);
    if (idx >= 0) this.mock[idx] = { ...game, id };
    return of(true).pipe(delay(200));
  }

  delete(id: string) {
    const idx = this.mock.findIndex((g) => g.id === id);
    if (idx >= 0) this.mock.splice(idx, 1);
    return of(true).pipe(delay(200));
  }
}


