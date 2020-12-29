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
    return _.sumBy(this.availableBands, 'maxResistanceAmount');
  }

  public get maxSelectedResistance(): number {
    return _.sumBy(this.selectedBands, 'maxResistanceAmount');
  }

  constructor() { }

  ngOnInit(): void {
  }

  /**
   * Sets the arrays of selected and available bands based on a comma-separated string of 
   * resistance band colors
   * @param selectedBands A string of resistance band colors currently selected
   */
  public setBandAllocation(selectedBands: string): void {
    
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
    
    this.okClicked.emit(selection);
  }

  public cancel(): void {
    this.cancelClicked.emit();
  }

}
