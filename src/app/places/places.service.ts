import { AuthService } from './../auth/auth.service';
import { Place } from './places.model';
import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

interface PlaceData {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlacesService {

  // new Place(
  //   '1',
  //   'Emirate City',
  //   'Ilu to jina sinaa',
  //   'https://hometown.ng/wp-content/uploads/2016/12/912554_mosque_jpg66ed08f6ddd1998af93439327c25e3bb-580x387.jpg',
  //   5000,
  //   new Date('2019-01-01'),
  //   new Date('2019-12-31'),
  //   'user1'),
  //   new Place(
  //     '2',
  //     'Lagos City',
  //     'Eko o ni bajee',
  //     'https://www.worldatlas.com/r/w728-h425-c728x425/upload/d2/c1/3c/shutterstock-620898968.jpg',
  //     8000,
  //     new Date('2019-01-01'),
  //     new Date('2019-12-31'),
  //     'user1'),
  //     new Place(
  //       '3',
  //       'Yenegoa',
  //       'Inside Bayelsa',
  //       'https://i.imgur.com/OviE6NU.jpg',
  //       7000,
  //       new Date('2019-01-01'),
  //       new Date('2019-12-31'),
  //       'user1'),

  private placesArray = new BehaviorSubject<Place[]>([]);

  constructor(private authService: AuthService, private http: HttpClient) { }

  get places() {
    return this.placesArray.asObservable();
  }

  fetchPlaces() {
    return this.http.get<{[key: string]: PlaceData}>('https://school-management-pro.firebaseio.com/offered-places.json')
    .pipe(map(resData => {
      const places = [];
      for (const key in resData) {
        if (resData.hasOwnProperty(key)) {
          places.push(
            new Place(
              key,
              resData[key].title,
              resData[key].description,
              resData[key].imageUrl,
              resData[key].price,
              new Date(resData[key].availableFrom),
              new Date(resData[key].availableTo),
              resData[key].userId
            )
          );
          console.log(key);
        }
      }
      console.log(places);
      return places;
    }),
    tap(places => {
      this.placesArray.next(places);
    })
    );
  }


  getPlace(id: string) {
    return this.http.get<PlaceData>(`https://school-management-pro.firebaseio.com/offered-places/${id}.json`)
      .pipe(map(resData => {
        return new Place(
          id,
          resData.title,
          resData.description,
          resData.imageUrl,
          resData.price,
          new Date(resData.availableFrom),
          new Date(resData.availableTo),
          resData.userId);
      }));
    // return this.placesArray.pipe(take(1), map(places => {
    //   return {...places.find(p => p.id === id)};
    // }));
  }

  addPlace(title: string, description: string, price: number, availableFrom: Date, availableTo: Date) {
    let generatedId: string;
    const newPlace = new Place(
      Math.random.toString(),
      title,
      description,
      'https://i.imgur.com/OviE6NU.jpg',
      price,
      availableFrom,
      availableTo,
      this.authService.userId
      );

    return this.http.post<{name: string}>(
        'https://school-management-pro.firebaseio.com/offered-places.json',
        { ...newPlace, id: null })
        .pipe(
          switchMap(resData => {
            generatedId = resData.name;
            return this.places;
          }),
          take(1),
          tap(places => {
            newPlace.id = generatedId;
            this.placesArray.next(places.concat(newPlace));
          })
          );
        }

  updatePlace(placeId: string, title: string, description: string) {
    let updatedPlaces: Place[];
    return this.placesArray.pipe(
      take(1), switchMap(places => {
        if (!places || places.length <= 0) {
          return this.fetchPlaces();
        } else {
          return of(places);
        }
      }),
      switchMap(places => {
        const updatePlaceIndex = places.findIndex(place => place.id === placeId);
        updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatePlaceIndex];
        updatedPlaces[updatePlaceIndex] = new Place(
        oldPlace.id,
        title,
        description,
        oldPlace.imageUrl,
        oldPlace.price,
        oldPlace.availableFrom,
        oldPlace.availableTo,
        oldPlace.userId
        );
        return this.http.put(
          `https://school-management-pro.firebaseio.com/offered-places/${placeId}.json`,
          { ...updatedPlaces[updatePlaceIndex], id: null});
      }),
      tap(() => {
        this.placesArray.next(updatedPlaces);
      })
      );

    }
  }

