import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'wt-exercise-plan',
  templateUrl: './exercise-plan.component.html',
  styleUrls: ['./exercise-plan.component.css']
})
export class ExercisePlanComponent implements OnInit {

  @Input()
  formGroup: FormGroup; //TODO: Use a strong-typed structure

  constructor() { }

  ngOnInit(): void {
    console.log('hi');
  }

}
