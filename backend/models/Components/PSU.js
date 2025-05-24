const mongoose = require("mongoose");

const psuSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    product_name: String,
    rating: Number,
    price: { type: Number, required: true },
    image_source: {
      type: String,
    },
    ProductLink: String,
    manfucaturer: String,
    brand: String,
    Amperage: String,
    MemoryType: String,
    FormFactor: String,
    Wattage: String,
  },
  { timestamps: true }
);

psuSchema.index({ title: "text", product_name: "text" });

module.exports = mongoose.model("PSU", psuSchema);
