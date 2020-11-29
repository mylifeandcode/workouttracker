import { Component } from '@angular/core';
import { ExerciseService } from 'app/exercises/exercise.service';
import { PaginatedResults } from '../../core/models/paginated-results';
import { finalize, map } from 'rxjs/operators';
import { ExerciseDTO } from 'app/models/exercise-dto';
import { TargetArea } from 'app/models/target-area';
import { ExerciseListBase } from '../exercise-list-base';

@Component({
  selector: 'wt-exercise-list',
  templateUrl: './exercise-list.component.html',
  styleUrls: ['./exercise-list.component.css']
})
export class ExerciseListComponent extends ExerciseListBase {

    //There is no ngOnInit or ngAfterViewInit here because the onLazyLoad() event of the PrimeNg
    //Turbo Table automatically makes a call to get data on initialization

    constructor(protected _exerciseSvc: ExerciseService) { 
        super(_exerciseSvc);
    }

    public getExercisesLazy(event: any): void {
        let nameContains: string;
        let targetAreaContains: string;

        if (event.filters["name"])
            nameContains = event.filters["name"].value;

        if (event.filters["targetAreas"])
            targetAreaContains = event.filters["targetAreas"].value;

        this.getExercises(event.first, nameContains, targetAreaContains);
    }
}
