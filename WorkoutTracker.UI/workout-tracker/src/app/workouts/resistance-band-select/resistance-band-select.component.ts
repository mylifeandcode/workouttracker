import { Component, Input, OnInit } from '@angular/core';
import { ResistanceBand } from 'app/shared/models/resistance-band';
import { ResistanceBandIndividual } from 'app/shared/models/resistance-band-individual';
import * as _ from "lodash";

@Component({
  selector: 'wt-resistance-band-select',
  templateUrl: './resistance-band-select.component.html',
  styleUrls: ['./resistance-band-select.component.css']
})
export class ResistanceBandSelectComponent implements OnInit {

  @Input()
  public resistanceBandInventory: ResistanceBandIndividual[];

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
    let selectedBandColors: string[] = (selectedBands ? selectedBands.split(',') : []);
    selectedBandColors.forEach((value: string) => value.trim());
    
    this.availableBands = this.resistanceBandInventory;
    
    selectedBandColors.forEach((bandColor: string) => {
      //Find first match in array of available bands
      let foundBand: ResistanceBandIndividual = this.availableBands.find(band => band.color == bandColor);
      if (foundBand) {
        this.selectedBands.push(foundBand);
        
      }

      //Pop band from available array and push it to the selected array
    });
  }

}
