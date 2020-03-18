const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Character = new Schema({
  first_name: { type: String, required: true, max: 100 },
  family_name: { type: String, required: true, max: 100 },
  dob: { type: Number },
  whatever: { type: String } //any other field
});

// Virtual for a character's age
Character.virtual("age").get(function () {
  const currentDate = new Date().getFullYear();
  const result = currentDate - this.dob;
  return result;
});

Character.set("toObject", { getters: true, virtuals: true });

const characterModel = mongoose.model("Character", Character);

module.exports = characterModel;
