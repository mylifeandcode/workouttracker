import { Component, EventEmitter, OnChanges, Output, Signal, SimpleChanges, WritableSignal, computed, input, signal } from '@angular/core';
import { ResistanceBandIndividual } from '../../../shared/models/resistance-band-individual';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTransferModule, TransferItem } from 'ng-zorro-antd/transfer';
import { ResistanceBandColorPipe } from "../../../shared/pipes/resistance-band-color.pipe";
import { ResistanceBandSelection } from '../../_models/resistance-band-selection';
import { ResistanceAmountPipe } from '../../_pipes/resistance-amount.pipe';

export interface IBandAllocation {
  selectedBandsDelimited: string;
  doubleMaxResistanceAmounts: boolean;
}

@Component({
    selector: 'wt-resistance-band-select',
    templateUrl: './resistance-band-select.component.html',
    styleUrls: ['./resistance-band-select.component.scss'],
    imports: [NzTransferModule, NzToolTipModule, ResistanceAmountPipe, ResistanceBandColorPipe]
})
export class ResistanceBandSelectComponent implements OnChanges {

  //INPUTS
  public readonly resistanceBandInventory = input.required<ResistanceBandIndividual[]>();
  public readonly exerciseUsesBilateralResistance = input<boolean>(false);
  public readonly bandAllocation = input.required<IBandAllocation>();


  //OUTPUTS
  @Output()
  public okClicked: EventEmitter<ResistanceBandSelection> = new EventEmitter<ResistanceBandSelection>();

  @Output()
  public cancelClicked: EventEmitter<void> = new EventEmitter<void>();


  //SIGNALS
  public availableTransferItems: WritableSignal<TransferItem[]> = signal([]);
  public selectedTransferItems: WritableSignal<TransferItem[]> = signal([]);
  
  public maxAvailableResistance: Signal<number> = computed(() => {
    let total: number = 0;

    this.availableTransferItems().forEach(item => {
      total += this.resistanceBandInventory().find(band => band.color == item.title)?.maxResistanceAmount || 0;
    });

    if (this._doubleMaxResistanceAmounts) {
      total *= 2;
    }

    return total;
  });

  public maxSelectedResistance: Signal<number> = computed(() => {
    let total: number = 0;

    this.selectedTransferItems().forEach(item => {
      total += this.resistanceBandInventory().find(band => band.color == item.title)?.maxResistanceAmount || 0;
    });

    if (this._doubleMaxResistanceAmounts) {
      total *= 2;
    }

    return total;
  });


  //PUBLIC VARIABLES
  public showBilateralValidationFailure: boolean = false;
  public transferItems: TransferItem[] = [];


  //PROTECTED VARIABLES
  protected _doubleMaxResistanceAmounts: boolean = false;


  //PUBLIC METHODS
  public ngOnChanges(changes: SimpleChanges): void {
    const bandAllocation = changes['bandAllocation'].currentValue as IBandAllocation;
    //console.log('alloction?: ', bandAllocation);
    
    if (bandAllocation)
      this.setBandAllocation(bandAllocation.selectedBandsDelimited, bandAllocation.doubleMaxResistanceAmounts);
    
    this.validateForBilateralResistance();
  }

  /**
   * Sets the arrays of selected and available bands based on a comma-separated string of 
   * resistance band colors
   * 
   * @param selectedBandsDelimited A string of resistance band colors currently selected
   * @param doubleMaxResistanceAmounts Specifies whether or not band resistances should be doubled. This should be true when the exercise does not use the band end-to-end without an anchor.
   */
  public setBandAllocation(selectedBandsDelimited: string, doubleMaxResistanceAmounts: boolean): void {

    this._doubleMaxResistanceAmounts = doubleMaxResistanceAmounts;

    const selectedBands: ResistanceBandIndividual[] = [];
    const availableBands: ResistanceBandIndividual[] = [...this.resistanceBandInventory()];
    const transferItemsTemp: TransferItem[] = []; //Needed because, apparently, nz-transfer uses OnPush change detection

    const selectedBandColors: string[] = (selectedBandsDelimited ? selectedBandsDelimited.split(',') : []);

    selectedBandColors.forEach((bandColor: string) => {
      //Find first match in array of available bands
      bandColor = bandColor.trim();
      const foundBand: ResistanceBandIndividual | undefined = availableBands.find(band => band.color == bandColor);
      if (foundBand) {
        selectedBands.push(foundBand);
        const indexInAvailableArray = availableBands.findIndex(band => band.color == bandColor);
        if (indexInAvailableArray > -1)
          availableBands.splice(indexInAvailableArray, 1);
      }
    });

    selectedBands.forEach((band: ResistanceBandIndividual, index: number) => {
      transferItemsTemp.push({
        key: `S${index}`,
        title: band.color,
        direction: 'right',
        disabled: false,
        checked: false
      });
    });

    availableBands.forEach((band: ResistanceBandIndividual, index: number) => {
      transferItemsTemp.push({
        key: `A${index}`,
        title: band.color,
        direction: 'left',
        disabled: false,
        checked: false
      });
    });

    this.transferItems = transferItemsTemp;
    //console.log('Transfer items: ', this.transferItems);
    this.allocateTransferItems();
  }

  public ok(): void {
    this.okClicked.emit(this.getResistanceBandSelection());
  }

  public cancel(): void {
    this.showBilateralValidationFailure = false;
    this.cancelClicked.emit();
  }

  public onTransferChange(): void {
    this.allocateTransferItems();
    this.validateForBilateralResistance();
  }  


  //PRIVATE METHODS
  private validateForBilateralResistance(): void {
    if (this.exerciseUsesBilateralResistance()) {
      //console.log('BILATERAL');
      if (this.selectedTransferItems().length <= 1) {
        this.showBilateralValidationFailure = true;
      }
      else {
        // Replace groupBy with native reduce
        const bandsByColor: Record<string, TransferItem[]> = this.selectedTransferItems().reduce((groups, band) => {
          const color = band.title;
          if (!groups[color]) {
            groups[color] = [];
          }
          groups[color].push(band);
          return groups;
        }, {} as Record<string, TransferItem[]>);
        
        //console.log('BANDS: ', bandsByColor);
        
        // Replace some() with Object.values().some()
        this.showBilateralValidationFailure = Object.values(bandsByColor).some(array => array.length % 2 !== 0);
        //console.log('BILATERAL VALIDATION: ', this.showBilateralValidationFailure);
      }
    }
  }

  private allocateTransferItems(): void {
    this.availableTransferItems.set(this.transferItems.filter(item => item.direction === 'left'));
    this.selectedTransferItems.set(this.transferItems.filter(item => item.direction === 'right'));
    //console.log('Available: ', this.availableTransferItems());
    //console.log('Selected: ', this.selectedTransferItems());
  }

  private getResistanceBandSelection(): ResistanceBandSelection {
    const selection = new ResistanceBandSelection();
    this.transferItems
     .filter(item => item.direction === 'right')
     .forEach(item => {
       const band = this.resistanceBandInventory().find(resistanceBand => resistanceBand.color == item.title);
       if (band) {
         selection.makeup += `${band.color},`;
       }
     });
 
     selection.makeup = selection.makeup.slice(0, -1); //Remove trailing comma
     selection.maxResistanceAmount = this.maxSelectedResistance();

     return selection;
  }

}
