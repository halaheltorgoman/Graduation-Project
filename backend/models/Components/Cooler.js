const mongoose = require('mongoose'); 

const coolerSchema = new mongoose.Schema({
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

  cooling_method:String,
  brand: String,
  air_flow_capacity: String,
  maximum_rotational_speed: String,
  compatible_cpu_sockets: Array,
   noise_level: String,
   voltage: String,
   compatible_lighting_type: String,
   radiator_size: String,
   wattage: String,
   fan_size: String,

}, { timestamps: true });

coolerSchema.index({ title: "text",});
module.exports = mongoose.model('Cooler', coolerSchema);