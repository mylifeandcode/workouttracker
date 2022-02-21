import { ResistanceType } from '../enums/resistance-type';
import { ResistanceTypePipe } from './resistance-type.pipe';

describe('ResistanceTypePipe', () => {
  
  const pipe = new ResistanceTypePipe();

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return the correct value for ResistanceType.BodyWeight', () => {
    expect(pipe.transform(ResistanceType.BodyWeight)).toEqual("Body Weight");
  });

  it('should return the correct value for ResistanceType.FreeWeight', () => {
    expect(pipe.transform(ResistanceType.FreeWeight)).toEqual("Free Weight");
  });

  it('should return the correct value for ResistanceType.MachineWeight', () => {
    expect(pipe.transform(ResistanceType.MachineWeight)).toEqual("Machine Weight");
  });
  
  it('should return the correct value for ResistanceType.Other', () => {
    expect(pipe.transform(ResistanceType.Other)).toEqual("Other");
  });
  
  it('should return the correct value for ResistanceType.ResistanceBand', () => {
    expect(pipe.transform(ResistanceType.ResistanceBand)).toEqual("Resistance Band");
  });
    
});
