import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ResistanceBand } from 'app/shared/models/resistance-band';
import { ResistanceBandIndividual } from 'app/shared/models/resistance-band-individual';
import * as _ from "lodash";
import { ResistanceBandSelection } from '../models/resistance-band-selection';

@Component({
  selector: 'wt-resistance-band-select',
  templateUrl: './resistance-band-select.component.html',
  styleUrls: ['./resistance-band-select.component.css']
})
export class ResistanceBandSelectComponent implements OnInit {

  @Input()
  public resistanceBandInventory: ResistanceBandIndividual[];

  @Output()
  public okClicked: EventEmitter<ResistanceBandSelection> = new EventEmitter<ResistanceBandSelection>();

  @Output()
  public cancelClicked: EventEmitter<void> = new EventEmitter<void>();

  public selectedBands: ResistanceBandIndividual[] = [];
  public availableBands: ResistanceBandIndividual[] = [];

  public get maxAvailableResistance(): number {
    return _.sumBy(this.availableBands, 'maxResistanceAmount') * (this._doubleMaxResistanceAmounts ? 2 : 1);
  }

  public get maxSelectedResistance(): number {
    return _.sumBy(this.selectedBands, 'maxResistanceAmount') * (this._doubleMaxResistanceAmounts ? 2 : 1);
  }

  private _doubleMaxResistanceAmounts: boolean;

  constructor() { }

  ngOnInit(): void {}

  /**
   * Sets the arrays of selected and available bands based on a comma-separated string of 
   * resistance band colors
   * @param selectedBands A string of resistance band colors currently selected
   * @param doubleMaxResistanceAmounts Specifies whether or not band resistances should be doubled. This should be true when the exercise does not use the band end-to-end without an anchor.
   */
  public setBandAllocation(selectedBands: string, doubleMaxResistanceAmounts: boolean): void {
    
    /*
    At one point, I'd gone down the path of making this private and having it called by 
    ngOnChanges() to avoid the need for this to be a ViewChild and have this method called 
    by the parent. I liked the idea of this behaving dynamically based solely on the @Inputs.

    The problem, however, was that, for ngOnChanges() to be fired, at least one of the @Inputs 
    must have changed -- must be different. And because all of the IDs values would still be 
    zero for a new workout, and because just the exercise ID itself wouldn't be enough, 
    it was starting to get into an area where the amount of complexity being introduced 
    would be greater than the benefit of not having to explicitly call this method. And since 
    everything was already working the current way (ViewChild and explicit method call), I 
    reverted the changes and kept things as-is. I'm still not a huge fan of using ViewChild, 
    but the code is simpler this way.
    */

    this._doubleMaxResistanceAmounts = doubleMaxResistanceAmounts;
    this.selectedBands = [];
    this.availableBands = [...this.resistanceBandInventory];

    let selectedBandColors: string[] = (selectedBands ? selectedBands.split(',') : []);
    //selectedBandColors.forEach((value: string) => value.trim());
    
    selectedBandColors.forEach((bandColor: string) => {
      //Find first match in array of available bands
      bandColor = bandColor.trim();
      let foundBand: ResistanceBandIndividual = this.availableBands.find(band => band.color == bandColor);
      if (foundBand) {
        this.selectedBands.push(foundBand);
        let indexInAvailableArray = this.availableBands.findIndex(band => band.color == bandColor);
        if (indexInAvailableArray > -1)
          this.availableBands.splice(indexInAvailableArray, 1);
      }
    });

  }

  public ok(): void {
    let selection = new ResistanceBandSelection();

    selection.makeup = 
      this.selectedBands
        .map((band: ResistanceBandIndividual) => band.color)
        .join(',');
    
    selection.maxResistanceAmount = this.maxSelectedResistance;

    if(this._doubleMaxResistanceAmounts)
    selection.maxResistanceAmount = selection.maxResistanceAmount * 2;
    
    this.okClicked.emit(selection);
  }

  public cancel(): void {
    this.cancelClicked.emit();
  }

}
