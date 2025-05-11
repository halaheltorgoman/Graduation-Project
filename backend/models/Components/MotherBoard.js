
const mongoose = require('mongoose');

const mbSchema = new mongoose.Schema({
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
  brand: String,
  chipset: String,
  MB_form: String,
  GPU_interface:String,
  

  manfacturer:{
    type: String,
    required: true,
  },

  supported_memory :String,
  MB_socket: String, 
  dimensions: String,
  
 
   series: String,
   storage_interface: String 

}, { timestamps: true });

mbSchema.index({ title: "text", manufacturer: "text",product_name:"text" });

module.exports = mongoose.model('Motherboard', mbSchema);