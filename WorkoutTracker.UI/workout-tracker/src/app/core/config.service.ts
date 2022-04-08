import { Injectable } from '@angular/core';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  static _configValues: Map<string, any> = new Map<string, any>(); //TODO: Re-evaluate static

  constructor() {}

  public init(configValues: any): void { //TODO: Strong type

      //Split config values up into array of objects containing key as first element and value as second
      let pairs: [string, unknown][] = _.toPairs(configValues);

      _.forEach(pairs, (pair) => {
        ConfigService._configValues.set(pair[0], pair[1]);
      });
  }

  public get(key: string): any {
    
    let setting = ConfigService._configValues.get(key);

    if (setting)
      return setting;
    else
      return null;
      
  }

}
