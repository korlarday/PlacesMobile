import { AuthService } from './../auth/auth.service';
import { BehaviorSubject } from 'rxjs';
import { Booking } from './booking.model';
import { Injectable } from '@angular/core';
import { take, tap, delay, switchMap, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

interface BookingData {
  bookedFrom: string;
  bookedTo: string;
  firstName: string;
  guestNumber: number;
  lastName: string;
  placeId: string;
  placeImage: string;
  placeTitle: string;
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private bookings = new BehaviorSubject<Booking[]>([]);

  constructor(private authService: AuthService, private http: HttpClient) { }

  get allBookings() {
  
    return this.bookings.asObservable();
  }

  addBooking(
    placeId: string,
    placeTitle: string,
    placeImage: string,
    firstName: string,
    lastName: string,
    numberOfGuests: number,
    DateFrom: Date,
    DateTo: Date) {
      let generatedId: string;
      const newBooking = new Booking(
        Math.random.toString(),
        placeId,
        this.authService.userId,
        placeTitle,
        placeImage,
        firstName,
        lastName,
        numberOfGuests,
        DateFrom,
        DateTo
      );

      return this.http.post<{name: string}>(
        'https://school-management-pro.firebaseio.com/bookings.json',
        {...newBooking, id: null}
      ).pipe(
        switchMap(resData => {
          generatedId = resData.name;
          return this.bookings;
        }),
        take(1),
        tap(bookings => {
          newBooking.id = generatedId;
          this.bookings.next(bookings.concat(newBooking));
        }));
  }

  cancelBooking(bookingId: string) {
    return this.http.delete(`https://school-management-pro.firebaseio.com/bookings/${bookingId}.json`)
    .pipe(switchMap(() => {
      return this.bookings;
    }),
      take(1),
      tap(bookings => {
        this.bookings.next(bookings.filter(b => b.id !== bookingId));
      })
    );
    // return this.bookings.pipe(take(1), delay(2000), tap(booking => {
    //   this.bookings.next(booking.filter(b => b.id !== bookingId));
    // }));
  }

  fetchBookings() {
   return this.http.get<{[key: string]: BookingData}>
    (`https://school-management-pro.firebaseio.com/bookings.json?orderBy="userId"&equalTo="${this.authService.userId}"`)
    .pipe(map(bookingData => {
      const bookings = [];
      for (const key in bookingData) {
        if(bookingData.hasOwnProperty(key)) {
          bookings.push(
            new Booking(
              key,
              bookingData[key].placeId,
              bookingData[key].userId,
              bookingData[key].placeTitle,
              bookingData[key].placeImage,
              bookingData[key].firstName,
              bookingData[key].lastName,
              bookingData[key].guestNumber,
              new Date(bookingData[key].bookedFrom),
              new Date(bookingData[key].bookedTo)
            )
          );
        }
      }
      return bookings;
    }),
      tap(bookings => {
        this.bookings.next(bookings);
      })
    );
  }
}
