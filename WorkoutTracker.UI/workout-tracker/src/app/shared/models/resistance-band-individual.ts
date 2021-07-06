/**
 * A class representing an individual resistance band. Same as the domain class, but
 * without the numberAvailable and entity properties.
 */
export class ResistanceBandIndividual {
  //TODO: Find a better solution to just duplicating these properties from the domain class.
  public color: string;
  public maxResistanceAmount: number;

  constructor(color: string, maxResistanceAmount: number) {
    this.color = color;
    this.maxResistanceAmount = maxResistanceAmount;
  }
}
