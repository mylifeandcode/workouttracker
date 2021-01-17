import { Component, Input, OnInit } from '@angular/core';
import { ExecutedExercise } from '../models/executed-exercise';

@Component({
  selector: 'wt-executed-exercises',
  templateUrl: './executed-exercises.component.html',
  styleUrls: ['./executed-exercises.component.css']
})
export class ExecutedExercisesComponent implements OnInit {

  @Input()
  executedExercises: ExecutedExercise[];

  constructor() { }

  ngOnInit(): void {
  }

}
