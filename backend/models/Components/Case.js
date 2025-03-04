
const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({ 
  title: { type: String, required: true ,
    },
    product_name: String,
    rating: Number ,
  price: { type: String, required: true ,
    },
   image_source: {
    type: String,
   
  },
  product_link:String,
  brand: String,
  case_type: String,
  
   PSU_formfactor: {
    type: String,
    default: "ATX"
  },
  supported_motherboards: {
    type: String,
    default: "ATX"
  },
  expansion_slots: Number,

  fan_placement:String,
  PSU_mounting: String,
  dimensions_in_cm: String,

}, { timestamps: true });

module.exports = mongoose.model('Case', caseSchema);