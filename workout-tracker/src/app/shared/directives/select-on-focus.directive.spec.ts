import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SelectOnFocusDirective } from '../directives/select-on-focus.directive';

//Helpful testing information found here: https://angular.io/guide/testing-attribute-directives#testing-attribute-directives

@Component({
  template: `<input wtSelectOnFocus value=""/>`,
  standalone: true,
  imports: [SelectOnFocusDirective]
})
class TestComponent { }

describe('SelectOnFocusDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let inputElement: DebugElement;

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      imports: [SelectOnFocusDirective, TestComponent]
    }).createComponent(TestComponent);

    fixture.detectChanges(); //Initial binding

    //Get the element with an attached SelectOnFocusDirective
    inputElement = fixture.debugElement.query(By.directive(SelectOnFocusDirective));
    expect(inputElement).toBeTruthy();
  });

  it('should select input value on focus', () => {
    //ARRANGE
    spyOn(inputElement.nativeElement, 'select');

    //ACT
    inputElement.nativeElement.dispatchEvent(new Event('focus'));
    //No fixture.detectChanges() needed here. There's no DOM change.

    //ASSERT
    expect(inputElement.nativeElement.select).toHaveBeenCalledTimes(1);
  });
});
