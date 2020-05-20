import { Subscription } from 'rxjs';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PlacesService } from './../../places.service';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { Place } from './../../places.model';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss'],
})
export class EditOfferPage implements OnInit, OnDestroy {

  place: Place;
  private placeSub: Subscription;
  form: FormGroup;
  isLoading = false;
  placeId: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private navCtrl: NavController,
    private placeService: PlacesService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
    ) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/offer');
        return;
      }
      this.isLoading = true;
      this.placeId = paramMap.get('placeId');
      this.placeSub = this.placeService.getPlace(paramMap.get('placeId')).subscribe(place => {
        this.place = place;
        this.form = new FormGroup({
          title: new FormControl(this.place.title, {
            updateOn: 'blur',
            validators: [Validators.required]
          }),
          description: new FormControl(this.place.description, {
            updateOn: 'blur',
            validators: [Validators.required, Validators.max(180)]
          })
        });
        this.isLoading = false;
      }, error => {
        this.alertCtrl.create({
          header: 'An error occured!',
          message: 'Place could not be fetched please try again later.',
          buttons: [{text: 'Okay', handler: () => {
            this.router.navigate(['/places/tabs/offers']);
          }}]
        })
        .then(alertEl => {
          alertEl.present();
        });
      });

    });

  }

  OnUpdateOffer() {
    if (!this.form.valid) {
      return;
    }

    this.loadingCtrl.create({
      message: 'Updating place...'
    }).then(loadingEl => {
      loadingEl.present();
      this.placeService.updatePlace(
        this.place.id,
        this.form.value.title,
        this.form.value.description).subscribe(() => {
          loadingEl.dismiss();
          this.router.navigate(['places/tabs/offers']);
        });
    });

  }

  ngOnDestroy() {
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }

}
