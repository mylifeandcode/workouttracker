import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ExerciseService } from '../exercise.service';
import { Exercise } from '../exercise';
import { TargetArea } from '../target-area';

@Component({
  selector: 'wt-exercise-edit',
  templateUrl: './exercise-edit.component.html',
  styleUrls: ['./exercise-edit.component.css']
})
export class ExerciseEditComponent implements OnInit {

  constructor(private _formBuilder: FormBuilder, private _exerciseSvc: ExerciseService) { }
  public targetAreas: Array<TargetArea>;

  ngOnInit() {
      this._exerciseSvc.getTargetAreas().subscribe((resp) => this.targetAreas = resp);
  }

}
