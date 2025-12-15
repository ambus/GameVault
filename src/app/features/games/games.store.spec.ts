import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { GamesStore } from './games.store';
import { GamesService } from './games.service';
import { Game } from './games.types';

describe('GamesStore', () => {
  let store: GamesStore;

  const mockGames: Game[] = [
    {
      id: '1',
      name: 'Test',
      genre: 'RPG',
      platform: 'PC',
      releaseDate: '2020-01-01',
      rating: 8
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GamesStore,
        {
          provide: GamesService,
          useValue: {
            list: () => of(mockGames),
            create: () => of(true),
            update: () => of(true),
            delete: () => of(true)
          }
        }
      ]
    });

    store = TestBed.inject(GamesStore);
  });

  it('powinien załadować listę gier', () => {
    store.loadGames();
    expect(store.games().length).toBe(1);
    expect(store.games()[0].name).toBe('Test');
  });
});


