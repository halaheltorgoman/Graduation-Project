
const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema({
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
  memory_size: String,
  DDR_generation: String,
  data_transfer_rate: String,
  memory_speed: String,

  

  manfacturer:{
    type: String,
    required: true,
  },

  product_dimensions:String,

ram_size:String,
  
 
   series: String,
   

}, { timestamps: true });

memorySchema.index({ title: "text", ram_size: "text", product_name:"text"});

module.exports = mongoose.model('Memory', memorySchema);