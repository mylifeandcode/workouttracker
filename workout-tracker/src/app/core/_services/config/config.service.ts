import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  static _configValues: Map<string, string | boolean | number> = new Map<string, string | boolean | number>(); //TODO: Re-evaluate static

  public init(configValues: object): void { //TODO: Strong type

    //Split config values up into array of objects containing key as first element and value as second
    const pairs: [string, unknown][] = Object.entries(configValues);

    pairs.forEach((pair) => {
      ConfigService._configValues.set(pair[0], (pair[1] as string | boolean | number));
    });
    }

  public get(key: string): string | boolean | number | null{

    const setting = ConfigService._configValues.get(key);

    if (setting)
      return setting;
    else
      return null;

  }

}
