
const mongoose = require('mongoose');

const gpuSchema = new mongoose.Schema({
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
  expansion_slots: String,
  RAM_size: String,
  

  manfacturer:{
    type: String,
    required: true,
  },

Graphics_RAM_Type:String,
  clock_speed: String, 
  resolution: String,
  
 
   series: String,
   video_output_interface: String 

}, { timestamps: true });

module.exports = mongoose.model('GPU', gpuSchema);