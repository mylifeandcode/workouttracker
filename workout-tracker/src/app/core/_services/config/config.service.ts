import { Injectable } from '@angular/core';
import { toPairs, forEach } from 'lodash-es';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  static _configValues: Map<string, any> = new Map<string, any>(); //TODO: Re-evaluate static

  constructor() {}

  public init(configValues: any): void { //TODO: Strong type

      //Split config values up into array of objects containing key as first element and value as second
      const pairs: [string, unknown][] = toPairs(configValues);

      forEach(pairs, (pair) => {
        ConfigService._configValues.set(pair[0], pair[1]);
      });
  }

  public get(key: string): any {
    if (ConfigService._configValues.has(key)) {
      return ConfigService._configValues.get(key);
    }
    return null;
  }

}
