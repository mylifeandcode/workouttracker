//Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

//PrimeNG
import { InputSwitchModule } from 'primeng/inputswitch';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

//WorkoutTracker
import { ExercisesRoutingModule } from './exercises-routing.module';
import { ExerciseListComponent } from './exercise-list/exercise-list.component';
import { ExerciseListMiniComponent } from './exercise-list-mini/exercise-list-mini.component';
import { ExerciseEditComponent } from './exercise-edit/exercise-edit.component';

import { ProgressSpinnerModule } from 'primeng/progressspinner';

@NgModule({
    imports: [
    CommonModule,
    TableModule,
    ExercisesRoutingModule,
    ReactiveFormsModule,
    InputSwitchModule,
    TooltipModule,
    MultiSelectModule,
    ProgressSpinnerModule,
    ExerciseListComponent,
    ExerciseListMiniComponent,
    ExerciseEditComponent
],
    exports: [
        ExerciseListMiniComponent
    ]
})
export class ExercisesModule { }
