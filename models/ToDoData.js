import mongoose from "mongoose";
import { type } from "os";

const ToDoSchema = new mongoose.Schema({
task : {type: String, required: true},
dueDate: {type:Date, required: true},
status: {type : String, default: "active"}

});

export const TaskData = mongoose.model("Task", ToDoSchema);


