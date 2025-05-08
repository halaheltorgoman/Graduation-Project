
const mongoose = require('mongoose');

const psuSchema = new mongoose.Schema({ 
  title: { type: String, required: true ,
    },
    productName: String,
    Rating: Number ,
  price: { type: Number, required: true ,
    },
   imageUrl: {
    type: String,
   
  },
  ProductLink:String,
  Manfucaturer:String,
  Brand: String,
  Amperage: String,
   MemoryType: String,
  FormFactor:String,
  Wattage: String,

}, { timestamps: true });

psuSchema.index({ title: "text"});

module.exports = mongoose.model('PSU', psuSchema);