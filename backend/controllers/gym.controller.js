import Gym from "../models/gym.model.js";

// SAVE EXERCISES
export const createExercise = async (req, res) => {
  const all = req.body;

  if (!all.template || !all.exercises || all.exercises.length === 0) {
    return res.status(400).json("Send all required fields");
  }
  const newExercise = new Gym(all);
  try {
    await newExercise.save();
    res.status(200).json({ success: true, data: newExercise });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({
        success: false,
        msg: "Server Error from: createExercise",
        error,
      });
  }
};

// SAVE SETS
export const saveSets = async (req, res) => {
  const { id, exerciseId } = req.params;
  const newSets = req.body; // Expecting an array of sets [{ number, kg, reps }, ...]

  try {
    const gym = await Gym.findById(id);
    if (!gym)
      return res.status(404).json({ success: false, msg: "Gym not found" });

    const exercise = gym.exercises.id(exerciseId); // the exercise id
    if (!exercise)
      return res.status(404).json({ success: false, msg: "Exercise not found" });

    // Replace the entire sets array safely
    exercise.sets = newSets;
    

    await gym.save();

    res.status(200).json({ success: true, msg: "Sets replaced successfully", exercise });
  } catch (error) {
    res.status(500).json({ success: false, msg: "Server error", error: error.message });
  }
};

// CLEAR SETS

export const clearSets = async(req, res) => {
  const { id } = req.params;
  try {
      const gym = await Gym.findById(id)
      gym.exercises.map((ex) =>{
        ex.sets = []
      })
      res.status(200).json({success: true, msg: "Succesfull Sets Update"})
  } catch (error) {
    res.status(500).json({success:false, msg: "Server Error"});
  }
}

// SAVE WORKOUT
export const saveWholeWorkout = async (req, res) => {
  const { id } = req.params;
  const {template, exercises} = req.body; // expecting [{ name, sets: [...] }, ...]
  try {
    const gym = await Gym.findById(id);
    if (!gym)
      return res.status(404).json({ success: false, msg: "Gym not found" });

    // Save as a new workout in the workouts array
    gym.workouts.push({
      template,
      exercises,
    });

    await gym.save();

    res
      .status(200)
      .json({
        success: true,
        msg: "Workout saved to history!",
        workouts: gym.workouts,
      });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, msg: "Server error", error: error.message });
  }
};

// ADD EXERCISES 👌
export const addExercise = async (req, res) => {
  const { id } = req.params;
  const newExercises = req.body.exercises;

  if (!newExercises || newExercises.length === 0) {
    return res.status(400).json("Send at least one exercise.");
  }

  try {
    const updatedGym = await Gym.findByIdAndUpdate(id, {
      $push: { exercises: newExercises },
    });
    if (!updatedGym) {
      return res
        .status(404)
        .json({ success: false, msg: "Template not found" });
    }

    res.status(200).json({ success: true, data: updatedGym });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, msg: "Generic Error" });
  }
};

// GET ALL EXERCISES 👌
export const getAllExercises = async (req, res) => {
  try {
    const exercises = await Gym.find({});
    return res.status(200).json({
      success: true,
      count: exercises.length,
      data: exercises,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, msg: "There is an error", error });
  }
};

// GET ALL WORKOUTS 
export const getWorkoutHistory = async (req, res) => {
  try {
    const gyms = await Gym.find({});

    // Flatten all workouts from each gym into one array
    const allWorkouts = gyms.flatMap(gym => 
      gym.workouts.map(workout => ({
        ...workout.toObject(),
        gymId: gym._id,
        Template: gym.template
      }))
    );
    res.status(200).json({
      success: true, 
      msg: "Successful Workout Retrieval",
      workoutHistory: allWorkouts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      msg: "Server error from getWorkoutHistory",
      error: error.message
    });
  }
};

// GET SINGLE WORKOUT 👌
export const getSingleWorkout = async (req, res) => {
  try {
    const { id } = req.params; // gym id needed
    const gym = await Gym.findById(id);
    if (!gym) {
      return res.status(404).json({ success: false, msg: "Gym not found" });
    }

    res.status(200).json({
      success: true,
      Template: gym.template,
      Data: { Workout: gym.workouts },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Server error from getWorkoutHistory",
      error,
    });
  }
};

// GET SINGLE EXERCISE
export const getSingleExercise = async (req, res) => {
  const { id } = req.params;
  // const singleExercise = req.body;
  try {
    const exercise = await Gym.findById(id);
    res.status(200).json({
      success: true,
      msg: "Template ID",
      TemplateId: id,
      data: exercise,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, msg: "There is an error!" });
  }
};

// GET SETS FOR SINGLE EXERCISE
export const getSetForSingleExercise = async (req, res) => {
  const { id, exerciseId } = req.params;

  try {
    const gymTemplate = await Gym.findById(id); // get the template id
    const exId = gymTemplate.exercises.id(exerciseId); // extract the id for each exercise

    res.status(200).json({
      success: true,
      msg: "Bellow is your single exID with its Name and Sets",
      ExerciseId: exId, // Contains the ExID and the name of the exercise with sets
      Exercise: exId.name,
      OnlySetsArray: exId.sets, // Contains only the sets for this one exercise
    });
  } catch (error) {}
};

// UPDATE EXERCISE 👌
export const updateExercise = async (req, res) => {
  try {
    const t = req.body;
    const { id } = req.params;

    if (!t.template || t.exercises.length === 0) {
      return res
        .status(400)
        .json({ success: false, msg: "All fields required" });
    }
    const exercise = await Gym.findByIdAndUpdate(id, t, { new: true });
    if (!exercise) {
      return res
        .status(400)
        .json({ success: false, msg: "Exercise not found" });
    }
    return res.status(200).json({ success: true, data: exercise });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, msg: "Generic Error" });
  }
};

// DELETE TEMPLATE 👌

export const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedExercise = await Gym.findByIdAndDelete(id);
    res.status(200).json({ success: true, msg: "Exersice is deleted" });
    console.log(deletedExercise);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, msg: "Server Error", error });
  }
};

// REMOVE EXERCISE 👌

export const removeExercise = async (req, res) => {
  try {
    const { id } = req.params;
    const { exerciseName } = req.body;

    const removedExercise = await Gym.findByIdAndUpdate(
      id,
      { $pull: { exercises: exerciseName } }, // $pull from exercises array
      { new: true } // return the updated document
    );

    res.status(200).json({ success: true, data: removedExercise });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, msg: "There is an error" });
  }
};

// DELETE ALL 👌

export const deleteAll = async (req, res) => {
  try {
    const all = req.body;
    const removeAll = await Gym.deleteMany({});
    res.status(200).json({ success: true, msg: "Succesfull Deletion" });
  } catch (error) {
    res.status(500).json({ success: false, msg: "There is an error" });
  }
};
