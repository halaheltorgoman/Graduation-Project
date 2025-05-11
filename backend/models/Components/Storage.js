const mongoose = require('mongoose'); 

const storageSchema = new mongoose.Schema({
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


  brand_name: String,
  size: String,
  
  interface_and_formfactor: String,
   read_speed: String,
   write_speed: String,
   read_write_speed: String,
   storage_type: String,
  
   connectivity_technology: String,
 

}, { timestamps: true });

storageSchema.index({ title: "text", product_name:"text"});
module.exports = mongoose.model('Storage', storageSchema);