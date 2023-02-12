import { Component, Input, OnInit } from '@angular/core';
import { ExecutedExercise } from '../models/executed-exercise';

@Component({
  selector: 'wt-executed-exercises',
  templateUrl: './executed-exercises.component.html',
  styleUrls: ['./executed-exercises.component.scss']
})
export class ExecutedExercisesComponent implements OnInit {

  @Input()
  executedExercises: ExecutedExercise[];

  @Input()
  showResults: boolean;

  constructor() { }

  ngOnInit(): void {
  }

}
