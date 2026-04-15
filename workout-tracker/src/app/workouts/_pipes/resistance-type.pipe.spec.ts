import { ResistanceType } from '../../api';
import { ResistanceTypePipe } from './resistance-type.pipe';

describe('ResistanceTypePipe', () => {
  
  const pipe = new ResistanceTypePipe();

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return the correct value for ResistanceType.BodyWeight', () => {
    expect(pipe.transform(ResistanceType.BODY_WEIGHT)).toEqual("Body Weight");
  });

  it('should return the correct value for ResistanceType.BodyWeight (lowercase)', () => {
    expect(pipe.transform(ResistanceType.BODY_WEIGHT, false)).toEqual("body weight");
  });

  it('should return the correct value for ResistanceType.FreeWeight', () => {
    expect(pipe.transform(ResistanceType.FREE_WEIGHT)).toEqual("Free Weight");
  });

  it('should return the correct value for ResistanceType.FreeWeight (lowercase)', () => {
    expect(pipe.transform(ResistanceType.FREE_WEIGHT, false)).toEqual("free weight");
  });

  it('should return the correct value for ResistanceType.MachineWeight', () => {
    expect(pipe.transform(ResistanceType.MACHINE_WEIGHT)).toEqual("Machine Weight");
  });

  it('should return the correct value for ResistanceType.MachineWeight (lowercase)', () => {
    expect(pipe.transform(ResistanceType.MACHINE_WEIGHT, false)).toEqual("machine weight");
  });
  
  it('should return the correct value for ResistanceType.Other', () => {
    expect(pipe.transform(ResistanceType.OTHER)).toEqual("Other");
  });

  it('should return the correct value for ResistanceType.Other (lowercase)', () => {
    expect(pipe.transform(ResistanceType.OTHER, false)).toEqual("other");
  });
  
  it('should return the correct value for ResistanceType.ResistanceBand', () => {
    expect(pipe.transform(ResistanceType.RESISTANCE_BAND)).toEqual("Resistance Band");
  });

  it('should return the correct value for ResistanceType.ResistanceBand (lowercase)', () => {
    expect(pipe.transform(ResistanceType.RESISTANCE_BAND, false)).toEqual("resistance band");
  });
  
});
