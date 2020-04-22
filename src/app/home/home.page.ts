import { Component, NgZone } from '@angular/core';
import { } from "google-maps";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  GoogleAutocomplete: any;
  autocomplete: any;
  autocompleteItems: any;

  destinationLat: any;
  destinationLng: any;

  originLat: any;
  originLng: any;

  handlerId: any;
  distance: any;
  navigationStarted = false;
  audio: any;
  audioStarted = false;

  constructor(private zone: NgZone) {
    this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
    this.autocomplete = { input: '' };
    this.autocompleteItems = [];
  }

  ngOnInit() {
    this.fetchCurrentLocation();
  }

  fetchCurrentLocation() {
    this.handlerId = setInterval(() => {
      navigator.geolocation.getCurrentPosition((position) => {
        this.originLat = position.coords.latitude;
        this.originLng = position.coords.longitude;
        if (this.destinationLat && this.destinationLng) {
          this.calculateAndPlaySound();
        }
      });
    }, 5000);
  }

  updateSearchResults() {
    this.navigationStarted = false;
    this.distance = 0;
    if (this.autocomplete.input == '') {
      this.autocompleteItems = [];
      return;
    }
    this.GoogleAutocomplete.getPlacePredictions({ input: this.autocomplete.input },
      (predictions, status) => {
        this.autocompleteItems = [];
        this.zone.run(() => {
          predictions && predictions.forEach((prediction) => {
            this.autocompleteItems.push(prediction);
          });
        });
      });
  }


  calculateDistance() {
    var R = 6371;
    var dLat = this.DegreetoRad((this.destinationLat - this.originLat))
    var dLon = this.DegreetoRad((this.destinationLng - this.originLng));
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.DegreetoRad(this.destinationLat)) * Math.cos(this.DegreetoRad(this.originLat)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d.toFixed(1);
  }

  DegreetoRad(value) {
    return value * Math.PI / 180;
  }

  selectSearchResult(item) {
    this.autocomplete.input = item.description;
    this.autocompleteItems = [];
    this.navigationStarted = true;
    var geocoder = new google.maps.Geocoder;
    geocoder.geocode({ 'placeId': item.place_id }, (results, status) => {
      if (status === 'OK') {
        this.destinationLat = results[0].geometry.location.lat();
        this.destinationLng = results[0].geometry.location.lng();
        this.calculateAndPlaySound();
      }
    });
  }

  calculateAndPlaySound() {
    this.distance = Number.parseFloat(this.calculateDistance());
    //play sound when distance is less than 300mts -- TODO: will change if needed
    if (this.distance < 0.3) {
      clearInterval(this.handlerId);
      this.audio = new Audio('../../assets/sounds/alarm1.mp3');
      this.audioStarted = true;
      this.audio.play();
    }
  }

  stopAudio(){
    this.audio.pause();
    this.audioStarted = false;
  }
}