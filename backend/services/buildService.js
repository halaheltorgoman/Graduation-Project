// backend/services/buildService.js
const CPU = require('../models/Components/CPU');
const GPU = require('../models/Components/GPU');
const Motherboard = require('../models/Components/MotherBoard');
const Case = require('../models/Components/Case');
const Memory = require('../models/Components/Memory');
const Storage = require('../models/Components/Storage');
const PSU = require('../models/Components/PSU');
const Cooler = require('../models/Components/Cooler');
//const User = require('../models/User');


const componentModels = {
  cpu: CPU,
  gpu: GPU,
  motherboard: Motherboard,
  memory: Memory,
  case: Case,
  psu: PSU,
  storage: Storage,
  cooling: Cooler,
};
const buildService = {
  getComponentModel: (type) => {
    const model = componentModels[type.toLowerCase()];
    if (!model) throw new Error(`Invalid component type: ${type}`);
    return model;
  },
  getCompatibleComponents: async (selectedComponents, targetType) => {
    try {
      switch(targetType.toLowerCase()) {
        case 'gpu':
          return await GPU.find({}).select('title imageUrl price ');
          
        case 'cpu':
          return await CPU.find({}).select('title imageUrl price ');
          
        case 'motherboard':
          if (!selectedComponents.cpu || !selectedComponents.gpu) {
            throw new Error('Please select CPU and GPU first');
          }

          const cpu = await CPU.findById(selectedComponents.cpu);
          if (!cpu) throw new Error('Invalid component selection');

          const compatibleChipsets = cpu.MB_chipsets.split(',').map(chipset => chipset.trim());


            return await Motherboard.find({
              MB_socket: cpu.socket,
             chipset: { $in: compatibleChipsets }
            }).select('title imageUrl price')

        case 'case':
          if (!selectedComponents.motherboard) {
            throw new Error('Please select motherboard first');
          }
          return await Case.find({}).select('title imageUrl price');

        case 'memory':
          const mbForMemory = await Motherboard.findById(selectedComponents.motherboard);
          if (!mbForMemory) throw new Error('Invalid motherboard selection');

          return await Memory.find({
            DDR_generation: mbForMemory.memory,
           // speed: { $lte: mbForMemory.maxMemorySpeed }
          }).select('title imageUrl price');

        case 'storage':
          
          return await Storage.find({}).select('title imageUrl price');

        case 'psu':
          if (!selectedComponents.motherboard || !selectedComponents.gpu || !selectedComponents.cpu) {
            throw new Error('Please select motherboard, GPU, and CPU first');
          }
          const mbForPSU = await Motherboard.findById(selectedComponents.motherboard);
          //const selectedCase = await Case.findById(selectedComponents.case);
          return await PSU.find({
           // formFactor: mbForPSU.form,
           // wattage: { $gte: calculateRequiredWattage(selectedComponents) }  edit in database
          }).select('title imageUrl price');

        /*  case 'cooling':
            if (!selectedComponents.cpu) {
              throw new Error('Please select CPU first');
            }
          
            // Find the selected CPU
            const cpuForCooling = await CPU.findById(selectedComponents.cpu);
            if (!cpuForCooling) throw new Error('Invalid CPU selection');
          
            // Log the CPU's socket
            console.log('CPU Socket:', cpuForCooling.socket);
          
            // Find coolers that are compatible with the CPU's socket
            const coolers = await Cooler.find({}).select('title imageUrl price');
          
            // Filter coolers based on compatible CPU sockets
            const compatibleCoolers = coolers.filter(cooler => {
              // Split the compatible_cpu_sockets string into an array of socket types
              const socketTypes = cooler.compatible_cpu_sockets.split(',').map(socket => socket.trim());
          
              // Check if the CPU's socket is in the socketTypes array
              return socketTypes.includes(cpuForCooling.socket);
            });
          
            // Log the compatible coolers
            console.log('Compatible Coolers:', compatibleCoolers);
          
            return compatibleCoolers; */
        case 'cooling':
          if (!selectedComponents.cpu) {
            throw new Error('Please select CPU first');
          }
          const cpuForCooling = await CPU.findById(selectedComponents.cpu);
          return await Cooler.find({
            compatible_cpu_sockets: cpuForCooling.socket,
         
          }).select('title imageUrl price'); 

        default:
          throw new Error(`Invalid component type: ${targetType}`);
      }
    } catch (err) {
      throw new Error(`Error getting components: ${err.message}`);
    }
  },


    // Validate complete build compatibility
    checkCompatibility: async (componentIds) => {
      try {
        const components = await buildService.getComponentsByIds(componentIds);
        
        const compatibilityChecks = {
          cpu_motherboard: buildService.checkCpuMotherboard(components.cpu, components.motherboard),
          //gpu_motherboard: buildService.checkGpuMotherboard(components.gpu, components.motherboard),
          motherboard_case: buildService.checkMotherboardCase(components.motherboard, components.case),
          memory_motherboard: buildService.checkMemoryMotherboard(components.memory, components.motherboard),
         // psu_wattage: buildService.checkPSUWattage(components.psu, components),
          cooling_cpu: buildService.checkCoolingCpu(components.cooling, components.cpu)
        };
  
        const isValid = Object.values(compatibilityChecks).every(check => check.valid);
        
        return {
          valid: isValid,
          checks: compatibilityChecks,
          warnings: buildService.generateWarnings(components)
        };
      } catch (err) {
        throw new Error(`Build validation failed: ${err.message}`);
      }
    },

    getComponentsByIds: async (componentIds) => {
      const components = {};
      
      await Promise.all(Object.entries(componentIds).map(async ([type, id]) => {
        const Model = componentModels[type];
        if (!Model) throw new Error(`Invalid component type: ${type}`);
        
        const component = await Model.findById(id);
        if (!component) throw new Error(`Invalid ${type} ID: ${id}`);
        
        components[type] = component;
      }));
  
      return components;
    },

    checkCpuMotherboard: (cpu, motherboard) => ({
      valid: cpu.socket === motherboard.MB_socket && 
            cpu.MB_chipsets.includes(motherboard.chipset),
      message: cpu.socket === motherboard.MB_socket ? 
            'CPU chipset not supported by motherboard' :
            'CPU socket mismatch with motherboard'
    }),
  
    /* checkGpuMotherboard: (gpu, motherboard) => ({
      valid: motherboard.expansionSlots.some(slot => 
        slot.type === gpu.interfaceType && 
        slot.version >= gpu.interfaceVersion
      ),
      message: 'GPU interface not supported by motherboard'
    }), */
  
    checkMotherboardCase: (motherboard, pcCase) => ({
      valid: pcCase.supported_motherboards.includes(motherboard.form),
      message: 'Motherboard form factor not supported by case'
    }),
  
    checkMemoryMotherboard: (memory, motherboard) => {
     
      const memoryGeneration = memory.DDR_generation
      const motherboardMemory = motherboard.memory
    
      // Check if the memory generation matches the motherboard's supported memory
      const isValid = memoryGeneration === motherboardMemory;
    
      return {
        valid: isValid,
        message: isValid ? 'Memory compatible with motherboard' : 'Memory incompatible with motherboard'
      };
    },
  
    /* checkPSUWattage: (psu, components) => ({
      valid: psu.wattage >= buildService.calculateTotalPower(components),
      message: 'PSU wattage insufficient for components'
    }), */
  
    checkCoolingCpu: (cooler, cpu) => {
      // Split the compatible_cpu_sockets string into an array of socket types
      const socketTypes = cooler.compatible_cpu_sockets.split(',').map(socket => socket.trim());
    
      // Check if the CPU's socket is in the socketTypes array
      const isValid = socketTypes.includes(cpu.socket);
    
      return {
        valid: isValid,
        message: isValid ? 'Cooler compatible with CPU' : 'Cooler incompatible with CPU'
      };
    }
  
  };
module.exports = buildService;
  /*
// Compatibility check functions
function cpuXmb(cpu, motherboard) {
  return (
    cpu.socket === motherboard.MB_socket &&
    cpu.MB_chipset.includes(motherboard.chipset)
  );
}

function mbXmemory(motherboard, memory) {
  return (
    memory.DDR_generation === motherboard.memory  
    //memory.speed <= motherboard.maxMemorySpeed &&
   // memory.modules <= motherboard.memorySlots
  );
}
/*function gpuXmb(gpu, motherboard) {
  return motherboard.GPU_interface.some(slot => 
    slot.type === gpu.expansion_slots
  );
}
function mbXcase(motherboard, pcCase) {
  return pcCase.supported_motherboards.includes(motherboard.form);
}
 */  //need edit in db





