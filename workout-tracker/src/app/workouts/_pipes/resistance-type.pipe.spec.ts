import { ResistanceType } from '../workout/_enums/resistance-type';
import { ResistanceTypePipe } from './resistance-type.pipe';

describe('ResistanceTypePipe', () => {
  
  const pipe = new ResistanceTypePipe();

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return the correct value for ResistanceType.BodyWeight', () => {
    expect(pipe.transform(ResistanceType.BodyWeight)).toEqual("Body Weight");
  });

  it('should return the correct value for ResistanceType.BodyWeight (lowercase)', () => {
    expect(pipe.transform(ResistanceType.BodyWeight, false)).toEqual("body weight");
  });

  it('should return the correct value for ResistanceType.FreeWeight', () => {
    expect(pipe.transform(ResistanceType.FreeWeight)).toEqual("Free Weight");
  });

  it('should return the correct value for ResistanceType.FreeWeight (lowercase)', () => {
    expect(pipe.transform(ResistanceType.FreeWeight, false)).toEqual("free weight");
  });

  it('should return the correct value for ResistanceType.MachineWeight', () => {
    expect(pipe.transform(ResistanceType.MachineWeight)).toEqual("Machine Weight");
  });

  it('should return the correct value for ResistanceType.MachineWeight (lowercase)', () => {
    expect(pipe.transform(ResistanceType.MachineWeight, false)).toEqual("machine weight");
  });
  
  it('should return the correct value for ResistanceType.Other', () => {
    expect(pipe.transform(ResistanceType.Other)).toEqual("Other");
  });

  it('should return the correct value for ResistanceType.Other (lowercase)', () => {
    expect(pipe.transform(ResistanceType.Other, false)).toEqual("other");
  });
  
  it('should return the correct value for ResistanceType.ResistanceBand', () => {
    expect(pipe.transform(ResistanceType.ResistanceBand)).toEqual("Resistance Band");
  });

  it('should return the correct value for ResistanceType.ResistanceBand (lowercase)', () => {
    expect(pipe.transform(ResistanceType.ResistanceBand, false)).toEqual("resistance band");
  });
  
});
