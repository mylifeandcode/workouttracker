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
import { SharedModule } from 'app/shared/shared.module';

@NgModule({
  declarations: [
    ExerciseListComponent, 
    ExerciseListMiniComponent, 
    ExerciseEditComponent
  ],
  imports: [
    CommonModule, 
    TableModule, 
    ExercisesRoutingModule, 
    SharedModule,
    ReactiveFormsModule,
    InputSwitchModule,
    TooltipModule,
    MultiSelectModule
  ], 
  exports: [
    ExerciseListMiniComponent
  ]
})
export class ExercisesModule { }
