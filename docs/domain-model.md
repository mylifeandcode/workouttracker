# Domain Model

Generated from `API/WorkoutTracker.Domain` and the EF Core setup in `API/WorkoutTracker.Data` (October 2026). Renders in GitHub, VS Code (Mermaid preview), and most Markdown viewers.

Every entity inherits `Entity` (`Id`, `CreatedByUserId`, `CreatedDateTime`, `ModifiedByUserId`, `ModifiedDateTime`). `NamedEntity` adds `Name`. Those audit columns and the inheritance are omitted from the diagram's attribute lists, and `Entity`/`NamedEntity` appear only as the base classes.

```mermaid
classDiagram
    direction LR

    class Entity {
        <<abstract>>
        +int Id
        +int CreatedByUserId
        +DateTime CreatedDateTime
        +int? ModifiedByUserId
        +DateTime? ModifiedDateTime
    }
    class NamedEntity {
        <<abstract>>
        +string Name
    }
    Entity <|-- NamedEntity

    %% ---------- Workouts ----------
    class Workout {
        +Guid PublicId
        +bool Active
    }
    class ExecutedWorkout {
        +Guid PublicId
        +DateTime? StartDateTime
        +DateTime? EndDateTime
        +string? Journal
        +int Rating
    }

    %% ---------- Exercises ----------
    class Exercise {
        +Guid PublicId
        +string Description
        +string Setup
        +string Movement
        +string PointsToRemember
        +ResistanceType ResistanceType
        +bool OneSided
        +bool? BandsEndToEnd
        +bool InvolvesReps
        +bool UsesBilateralResistance
    }
    class ExerciseInWorkout {
        +byte NumberOfSets
        +SetType SetType
        +byte Sequence
    }
    class ExecutedExercise {
        +byte Sequence
        +byte TargetRepCount
        +byte ActualRepCount
        +decimal ResistanceAmount
        +string? ResistanceMakeup
        +SetType SetType
        +ushort? Duration
        +byte FormRating
        +byte RangeOfMotionRating
        +ExerciseSide? Side
        +string? Notes
    }
    class TargetArea
    class ExerciseTargetAreaLink {
        <<join>>
    }

    %% ---------- Resistances ----------
    class Resistance {
        +decimal Amount
    }
    class BandResistance {
        +string Color
    }
    class ResistanceBand {
        +Guid PublicId
        +string Color
        +decimal MaxResistanceAmount
        +short NumberAvailable
    }

    %% ---------- Executed sets ----------
    class ExecutedSet {
        <<abstract>>
    }
    class ExecutedRepetitionSet {
        +int ExecutedRepCount
    }
    class ExecutedTimedSet {
        +TimeSpan ExecutedTime
    }

    %% ---------- Users ----------
    class User {
        +Guid PublicId
        +string EmailAddress
        +UserRole Role
        +string? ProfilePic
        +bool PasswordProtected
    }
    class UserSettings {
        +int UserId
        +bool RecommendationsEnabled
        +byte LowestAcceptableRating
    }
    class UserMinMaxReps {
        +SetType SetType
        +ushort? Duration
        +byte MinReps
        +byte MaxReps
    }
    class RefreshToken {
        +string TokenHash
        +DateTime ExpiryDate
        +bool IsRevoked
    }

    %% ---------- Enums ----------
    class ResistanceType {
        <<enumeration>>
        FreeWeight
        MachineWeight
        ResistanceBand
        BodyWeight
        Other
    }
    class SetType {
        <<enumeration>>
        Repetition
        Timed
    }
    class ExerciseSide {
        <<enumeration>>
        Left
        Right
    }
    class UserRole {
        <<enumeration>>
        Standard
        Administrator
    }

    %% ---------- Inheritance ----------
    Entity <|-- Workout
    NamedEntity <|-- Workout
    NamedEntity <|-- Exercise
    NamedEntity <|-- TargetArea
    NamedEntity <|-- User
    Entity <|-- ExerciseInWorkout
    Entity <|-- ExecutedExercise
    Entity <|-- ExecutedWorkout
    Entity <|-- ExerciseTargetAreaLink
    Entity <|-- Resistance
    Entity <|-- ResistanceBand
    Entity <|-- ExecutedSet
    Entity <|-- UserSettings
    Entity <|-- UserMinMaxReps
    Entity <|-- RefreshToken
    Resistance <|-- BandResistance
    ExecutedSet <|-- ExecutedRepetitionSet
    ExecutedSet <|-- ExecutedTimedSet

    %% ---------- Relationships ----------
    Workout "1" *-- "many" ExerciseInWorkout : Exercises
    ExerciseInWorkout "many" --> "1" Exercise
    ExecutedWorkout "many" --> "1" Workout : performed from
    ExecutedWorkout "1" *-- "many" ExecutedExercise : Exercises
    ExecutedExercise "many" --> "1" Exercise
    ExecutedExercise "1" o-- "many" Resistance : Resistances (unused)
    ExecutedSet "many" --> "1" ExecutedExercise
    Exercise "1" *-- "many" ExerciseTargetAreaLink
    ExerciseTargetAreaLink "many" --> "1" TargetArea
    User "1" *-- "1" UserSettings : Settings
    UserSettings "1" *-- "many" UserMinMaxReps : RepSettings
    RefreshToken "many" --> "1" User
    RefreshToken "0..1" --> "0..1" RefreshToken : ReplacedByToken
```

## Notes

- **Template vs. history.** `Workout` / `ExerciseInWorkout` are the reusable plan. `ExecutedWorkout` / `ExecutedExercise` are a recorded occurrence of it. `ExecutedExercise` copies its own `Sequence`, `SetType`, and `TargetRepCount` rather than pointing at `ExerciseInWorkout`.
- **Exercise ↔ TargetArea** is many-to-many through the explicit `ExerciseTargetAreaLink` entity. `TargetArea` has no navigation back to the link.
- **Public IDs.** `Workout`, `ExecutedWorkout`, `Exercise`, `ResistanceBand`, and `User` implement `IPublicEntity` (`Guid PublicId`), which is what the API exposes.
- **`CreatedByUserId` / `ModifiedByUserId`** are plain ints on every entity, not mapped navigations to `User`, so they are not drawn as relationships.
- **`UserSettings.UserId`** is the FK, but `User` owns the `Settings` navigation. `UserSettings` is not a `DbSet` of its own, so it is reached through `Users`.

## Defined but not (fully) in use

- `ExecutedExercise.Resistances` → `Resistance` is marked `//TODO: Remove! Unused.` in code. `Resistance` and `BandResistance` are otherwise orphaned from the main flow (`BandResistance` has no `DbSet`).
- `ExecutedSet`, `ExecutedRepetitionSet`, `ExecutedTimedSet` are mapped (`DbSet<ExecutedSet>`), but the app's current model keeps rep/time data directly on `ExecutedExercise`.
- `Set`, `RepetitionSet`, `TimedSet`, `SuperSet` exist in `Domain/Sets` but are not mapped (`DbSet<Set>` is commented out) and are omitted from the diagram. `SuperSet` is an empty TODO stub.
- `UserGoal` enum is defined but its uses in `UserSettings` / `UserMinMaxReps` are commented out.
