// This file is required by karma.conf.js and loads recursively all the .spec and framework files

//import 'zone.js/testing'; //Removed for Zoneless Change Detection. TODO: Remove entirely once proven stable.
import { getTestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserTestingModule,
  platformBrowserTesting(),
);
