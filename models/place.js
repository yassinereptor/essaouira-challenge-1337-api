const mongoose = require("mongoose");

const { Schema } = mongoose;

const PlaceSchema = new Schema({
  name: String,
  address: String,
  serie: String,
  author: String,
  city: String,
  region: String,
  image: String,
image360: Array,
  description: String,
  created_at: Date,
  lat: String,
  lng: String,
});

mongoose.model("Place", PlaceSchema);
