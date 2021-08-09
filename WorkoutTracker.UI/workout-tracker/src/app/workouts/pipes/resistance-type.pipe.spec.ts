import { ResistanceType } from '../enums/resistance-type';
import { ResistanceTypePipe } from './resistance-type.pipe';

describe('ResistanceTypePipe', () => {
  it('create an instance', () => {
    const pipe = new ResistanceTypePipe();
    expect(pipe).toBeTruthy();
  });

  it('should return the correct value for ResistanceType.BodyWeight', () => {
    const pipe = new ResistanceTypePipe();
    expect(pipe.transform(ResistanceType.BodyWeight)).toEqual("Body Weight");
  });

  it('should return the correct value for ResistanceType.FreeWeight', () => {
    const pipe = new ResistanceTypePipe();
    expect(pipe.transform(ResistanceType.FreeWeight)).toEqual("Free Weight");
  });

  it('should return the correct value for ResistanceType.MachineWeight', () => {
    const pipe = new ResistanceTypePipe();
    expect(pipe.transform(ResistanceType.MachineWeight)).toEqual("Machine Weight");
  });
  
  it('should return the correct value for ResistanceType.Other', () => {
    const pipe = new ResistanceTypePipe();
    expect(pipe.transform(ResistanceType.Other)).toEqual("Other");
  });
  
  it('should return the correct value for ResistanceType.ResistanceBand', () => {
    const pipe = new ResistanceTypePipe();
    expect(pipe.transform(ResistanceType.ResistanceBand)).toEqual("Resistance Band");
  });  
});
