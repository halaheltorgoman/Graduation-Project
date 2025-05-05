
const mongoose = require('mongoose'); 

const cpuSchema = new mongoose.Schema({
  title: { type: String, required: true ,
    },
    product_name: String,
    rating: Number ,
  price: { type: Number, required: true ,
    },
   image_source: {
    type: String,
   
  },
  product_link:String,
  manfacturer:{
    type: String,
    required: true,
  },


  brand: String,
  case_type: String,
  
   cache: String,
   cores:Number,
   threads: Number,
   socket: String,
   turbo_clock: String,
   base_clock: String,
   processor_speed: String,
   MB_chipsets: Array,
   series: String,
   wattage: String,

}, { timestamps: true });

cpuSchema.index({ title: "text", manufacturer: "text" });
module.exports = mongoose.model('CPU', cpuSchema);