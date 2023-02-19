import { Component, Input, OnInit } from '@angular/core';
import { ExecutedExerciseDTO } from '../models/executed-exercise-dto';

@Component({
  selector: 'wt-executed-exercises',
  templateUrl: './executed-exercises.component.html',
  styleUrls: ['./executed-exercises.component.scss']
})
export class ExecutedExercisesComponent implements OnInit {

  @Input()
  executedExercises: ExecutedExerciseDTO[];

  @Input()
  showResults: boolean;

  constructor() { }

  ngOnInit(): void {
  }

}
