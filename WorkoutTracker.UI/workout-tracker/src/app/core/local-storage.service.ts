import { Injectable } from '@angular/core';

//Based on example found at https://firstclassjs.com/persist-data-using-local-storage-and-angular/

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  private _localStorage: Storage;

  constructor() {
    this._localStorage = window.localStorage;
  }

  public get(key: string): any {
    if (this.isLocalStorageSupported) {
      return JSON.parse(this._localStorage.getItem(key));
    }

    return null;
  }

  public set(key: string, value: any): boolean {
    if (this.isLocalStorageSupported) {
      this._localStorage.setItem(key, JSON.stringify(value));

      return true;
    }

    return false;
  }

  public remove(key: string): boolean {
    if (this.isLocalStorageSupported) {
      this._localStorage.removeItem(key);

      return true;
    }

    return false;
  }

  public get isLocalStorageSupported(): boolean {
    return !!this._localStorage
  }
}
