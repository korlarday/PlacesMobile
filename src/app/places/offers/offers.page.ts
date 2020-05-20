import { Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Place } from '../places.model';
import { PlacesService } from '../places.service';
import { IonItemSliding } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit, OnDestroy {

  offers: Place[];
  isLoading = false;
  private offersSub: Subscription;

  constructor(private placesService: PlacesService, private router: Router) { }

  ngOnInit() {
    this.offersSub = this.placesService.places.subscribe(places => {
      this.offers = places;
    });
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.placesService.fetchPlaces().subscribe(() => {
      this.isLoading = false;
    });
  }

  onEdit(id: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.router.navigate(['/', 'places', 'tabs', 'offers', 'edit', id]);
    console.log('Editing Item ', id);
  }

  ngOnDestroy() {
    if (this.offersSub) {
      this.offersSub.unsubscribe();
    }
  }

}
