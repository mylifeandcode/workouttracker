import { Component, EventEmitter, OnChanges, OnInit, Output, SimpleChanges, input } from '@angular/core';
import { ResistanceBandIndividual } from 'app/shared/models/resistance-band-individual';
import { ResistanceBandSelection } from '../../_models/resistance-band-selection';
import { sumBy, groupBy, some } from 'lodash-es';
import { Dictionary } from 'lodash';
import { PickListMoveToSourceEvent, PickListMoveToTargetEvent, PickListModule } from 'primeng/picklist';
import { SharedModule } from 'primeng/api';
import { NgStyle } from '@angular/common';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { ResistanceAmountPipe } from '../../_pipes/resistance-amount.pipe';

@Component({
    selector: 'wt-resistance-band-select',
    templateUrl: './resistance-band-select.component.html',
    styleUrls: ['./resistance-band-select.component.scss'],
    imports: [PickListModule, SharedModule, NgStyle, NzToolTipModule, ResistanceAmountPipe]
})
export class ResistanceBandSelectComponent implements OnInit, OnChanges {

  public readonly resistanceBandInventory = input<ResistanceBandIndividual[]>([]);

  public readonly exerciseUsesBilateralResistance = input<boolean>(false);

  @Output()
  public okClicked: EventEmitter<ResistanceBandSelection> = new EventEmitter<ResistanceBandSelection>();

  @Output()
  public cancelClicked: EventEmitter<void> = new EventEmitter<void>();

  public selectedBands: ResistanceBandIndividual[] = [];
  public availableBands: ResistanceBandIndividual[] = [];
  public showBilateralValidationFailure: boolean = false;

  public get maxAvailableResistance(): number {
    return sumBy(this.availableBands, 'maxResistanceAmount') * (this._doubleMaxResistanceAmounts ? 2 : 1);
  }

  public get maxSelectedResistance(): number {
    return sumBy(this.selectedBands, 'maxResistanceAmount') * (this._doubleMaxResistanceAmounts ? 2 : 1);
  }

  private _doubleMaxResistanceAmounts: boolean = false;

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    this.validateForBilateralResistance();
  }

  ngOnInit(): void {}

  /**
   * Sets the arrays of selected and available bands based on a comma-separated string of 
   * resistance band colors
   * 
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
    this.availableBands = [...this.resistanceBandInventory()];

    const selectedBandColors: string[] = (selectedBands ? selectedBands.split(',') : []);
    //selectedBandColors.forEach((value: string) => value.trim());

    selectedBandColors.forEach((bandColor: string) => {
      //Find first match in array of available bands
      bandColor = bandColor.trim();
      const foundBand: ResistanceBandIndividual | undefined = this.availableBands.find(band => band.color == bandColor);
      if (foundBand) {
        this.selectedBands.push(foundBand);
        const indexInAvailableArray = this.availableBands.findIndex(band => band.color == bandColor);
        if (indexInAvailableArray > -1)
          this.availableBands.splice(indexInAvailableArray, 1);
      }
    });

  }

  public ok(): void {

    const selection = new ResistanceBandSelection();

    selection.makeup =
      this.selectedBands
        .map((band: ResistanceBandIndividual) => band.color)
        .join(',');

    selection.maxResistanceAmount = this.maxSelectedResistance;

    //Pretty sure the amounts have already been doubled if need be by this point
    /*
    if(this._doubleMaxResistanceAmounts)
    selection.maxResistanceAmount = selection.maxResistanceAmount * 2;
    */

    this.okClicked.emit(selection);
  }

  public cancel(): void {
    this.showBilateralValidationFailure = false;
    this.cancelClicked.emit();
  }

  public bandSelected(event: PickListMoveToTargetEvent): void {
    this.validateForBilateralResistance();
  }

  public bandDeselected(event: PickListMoveToSourceEvent): void {
    this.validateForBilateralResistance();
  }

  private validateForBilateralResistance(): void {
    if (this.exerciseUsesBilateralResistance()) {
      if (this.selectedBands.length == 0) {
        this.showBilateralValidationFailure = true;
      }
      else {
        const bandsByColor: Dictionary<ResistanceBandIndividual[]> = groupBy(this.selectedBands, band => band.color);
        this.showBilateralValidationFailure = some(bandsByColor, array => array.length % 2 !== 0);
      }
    }
  }

}
