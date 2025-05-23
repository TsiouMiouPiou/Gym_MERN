import React, { useEffect, useState } from "react";
import BackButton from "./components/BackButton";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { IoIosRemoveCircle } from "react-icons/io";

const AddExercise = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [exercises, setExercises] = useState([]);
  
  const [template, setTemplate] = useState("");
  const [newExercise, setNewExercise] = useState("");

  useEffect(() => {
    axios.get(`http://localhost:5000/exercises/${id}`)
          .then((res) => {
          setTemplate(res.data.data.template);
    });
  });

  const handleExercise = () => {
    if (!newExercise.trim()) {
      alert("No empty values are accepted");
      return;
    }
    const exerciseObj = { name: newExercise};
    setExercises((prev) => [...prev, exerciseObj]);
    setNewExercise("");
  };

  const handleRemove = (removedElement) => {
    setExercises(exercises.filter((i) => i !== removedElement));
    // filter() runs all the elements and keeps all i(elements) except removedElement
  };

  const handleSave = () => {
    const data = {
      template,
      exercises: exercises,
    };
    axios
      .post(`http://localhost:5000/exercises/${id}`, data)
      .then((res) => {
        setExercises(res.data.data.exercises);
        alert("Exercises are added");
        navigate("/");
        console.log(data);
      })
      .catch((error) => {
        alert("There is an error");
        console.error("Full axios error:", error);
        if (error.response) {
          console.log("Response Data", error.response.data);
          console.log("Status code", error.response.status);
          console.log("Headers", error.response.headers);
        } else if (error.request) {
          console.log("No response received, Request was:", error.request);
        } else {
          console.log("Error setting up the request", error.message);
        }
      });
  };
  return (
    <>
      <div className="">
        <BackButton />
      </div>
      <div className="max-w-xl mx-auto border-2 p-10 rounded-2xl border-green-300 shadow-2xl">
        <div className="flex ">
          <h1 className="text-4xl text-green-600 font-bold ">Add Exercises</h1>
          {/* <h3 className="ml-10 text-xl">From '{template} Template' </h3> */}
        </div>
        <div className="pt-10 flex justify-between">
          <input
            className="text-xl  border-2 rounded-xl py-1 px-3 "
            type="text"
            placeholder="Add Exercise"
            value={newExercise}
            onChange={(e) => setNewExercise(e.target.value)}
          />
          <button
            className="text-2xl border-2 mx-10 px-5 bg-green-400 cursor-pointer"
            onClick={handleExercise}
          >
            Add
          </button>
        </div>
        <div className="mt-10 text-2xl  ">
          {exercises.map((ex, index) => (
            <div className="flex justify-between" key={index}>
                {ex.name}
              <button onClick={() => handleRemove(ex)}>
                <IoIosRemoveCircle className="text-red-500 cursor-pointer" />
              </button>
            </div>
          ))}
        </div>
        <button
          className="mt-5 text-3xl border-1 text-center w-full bg-indigo-400 cursor-pointer"
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </>
  );
};

export default AddExercise;
