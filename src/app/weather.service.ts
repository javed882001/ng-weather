import {Injectable, Signal, signal} from '@angular/core';
import {Observable, of} from 'rxjs';

import {HttpClient} from '@angular/common/http';
import {CurrentConditions} from './current-conditions/current-conditions.type';
import {ConditionsAndZip, ConditionsAndZipWithUpdatedDate} from './conditions-and-zip.type';
import {Forecast,ForecastWithUpdatedDate} from './forecasts-list/forecast.type';
import { tap } from "rxjs/operators";

export const DURATION_FOR_CACHE = 1000 * 60 * 60 * 2; // 2 hours
@Injectable()
export class WeatherService {
  static URL = "https://api.openweathermap.org/data/2.5";
  static APPID = "5a4b2d457ecbef9eb2a71e480b947604";
  static ICON_URL =
    "https://raw.githubusercontent.com/udacity/Sunshine-Version-2/sunshine_master/app/src/main/res/drawable-hdpi/";
  private currentConditions = signal<ConditionsAndZip[]>([]);

  private isExpiredCacheData(updatedDate: string) {
    const difference = new Date().getTime() - new Date(updatedDate).getTime();
    return difference >= DURATION_FOR_CACHE;
  }

  private clearCurrentConditions() {
    this.currentConditions.set([]);
  }

  private concatPrefixAndZipcode(
    zipcode: string,
    prefix: "CurrentCondition-" | "Forecast-" = "CurrentCondition-"
  ): string {
    return prefix + zipcode;
  }

  private getForecastKey(zipcode: string) {
    return this.concatPrefixAndZipcode(zipcode, "Forecast-");
  }

  private getCurrentConditionKey(zipcode: string) {
    return this.concatPrefixAndZipcode(zipcode, "CurrentCondition-");
  }

  private hasCurrentConditionOnCache(zipcode: string) {
    const currentConditionsByZipcode: ConditionsAndZipWithUpdatedDate | null =
      JSON.parse(localStorage.getItem(this.getCurrentConditionKey(zipcode)));

    if (
      currentConditionsByZipcode &&
      !this.isExpiredCacheData(currentConditionsByZipcode.updatedDate)
    ) {
      this.currentConditions.update((conditions) =>
        ([...conditions, currentConditionsByZipcode]));
      return true;
    }

    return false;
  }

  private getForecastOnCache(zipcode: string) {
    const forecast: ForecastWithUpdatedDate | null = JSON.parse(
      localStorage.getItem(this.getForecastKey(zipcode))
    );
    if (forecast && !this.isExpiredCacheData(forecast.updatedDate)) {
      return forecast;
    }
    return null;
  }

  constructor(private http: HttpClient) {}

  getAllCurrentConditions(locations: string[]) {
    this.clearCurrentConditions();
    for (let loc of locations) this.addCurrentConditions(loc);
  }

  addCurrentConditions(zipcode: string): void {
    if (this.hasCurrentConditionOnCache(zipcode)) return;

    // Here we make a request to get the current conditions data from the API. Note the use of backticks and an expression to insert the zipcode
    this.http
      .get<CurrentConditions>(
        `${WeatherService.URL}/weather?zip=${zipcode},us&units=imperial&APPID=${WeatherService.APPID}`
      )
      .subscribe((data) => {
        const conditionsAndZip: ConditionsAndZipWithUpdatedDate = {
          zip: zipcode,
          data,
          updatedDate: new Date().toLocaleString(),
        };
        localStorage.setItem(
          this.getCurrentConditionKey(zipcode),
          JSON.stringify(conditionsAndZip)
        );
        this.currentConditions.update((conditions) =>
          ([...conditions, conditionsAndZip]));
      });
  }

  getCurrentConditions(): Signal<ConditionsAndZip[]> {
    return this.currentConditions.asReadonly();
  }

  getForecast(zipcode: string): Observable<Forecast> {
    const forecastOnCache = this.getForecastOnCache(zipcode);
    if (forecastOnCache) return of(forecastOnCache);

    // Here we make a request to get the forecast data from the API. Note the use of backticks and an expression to insert the zipcode
    return this.http
      .get<Forecast>(
        `${WeatherService.URL}/forecast/daily?zip=${zipcode},us&units=imperial&cnt=5&APPID=${WeatherService.APPID}`
      )
      .pipe(
        tap((data) => {
          localStorage.setItem(
            this.getForecastKey(zipcode),
            JSON.stringify({
              ...data,
              updatedDate: new Date().toLocaleString(),
            } as ForecastWithUpdatedDate)
          );
        })
      );
  }

  
  getWeatherIcon(id): string {
    if (id >= 200 && id <= 232)
      return WeatherService.ICON_URL + "art_storm.png";
    else if (id >= 501 && id <= 511)
      return WeatherService.ICON_URL + "art_rain.png";
    else if (id === 500 || (id >= 520 && id <= 531))
      return WeatherService.ICON_URL + "art_light_rain.png";
    else if (id >= 600 && id <= 622)
      return WeatherService.ICON_URL + "art_snow.png";
    else if (id >= 801 && id <= 804)
      return WeatherService.ICON_URL + "art_clouds.png";
    else if (id === 741 || id === 761)
      return WeatherService.ICON_URL + "art_fog.png";
    else
      return WeatherService.ICON_URL + "art_clear.png";
  }

}
