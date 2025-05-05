const CPU = require('../models/Components/CPU');
const GPU = require('../models/Components/GPU');
const Motherboard = require('../models/Components/MotherBoard');
const Case = require('../models/Components/Case');
const Memory = require('../models/Components/Memory');
const Storage = require('../models/Components/Storage');
const PSU = require('../models/Components/PSU');
const Cooler = require('../models/Components/Cooler');



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
      switch (targetType.toLowerCase()) {
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
          const compatibleChipsets = cpu.MB_chipsets;
          return await Motherboard.find({
            MB_socket: cpu.socket,
            chipset: { $in: compatibleChipsets }
          }).select('title MB_socket chipset');
        case 'case':
          const motherboard = await Motherboard.findById(selectedComponents.motherboard);
          if (!motherboard) {
            throw new Error('Motherboard not found');
          }
          return await Case.find({
            supported_motherboards: { $in: [motherboard.MB_form] }
          }).select('title supported_motherboards price memory');

        case 'memory':
          const mbForMemory = await Motherboard.findById(selectedComponents.motherboard);
          if (!mbForMemory) throw new Error('Invalid motherboard selection');

          return await Memory.find({
            DDR_generation: mbForMemory.supported_memory,
            // speed: { $lte: mbForMemory.maxMemorySpeed }
          }).select('title DDR_generation price');

        case 'storage':

          return await Storage.find({}).select('title imageUrl price');

        case 'psu':
          if (!selectedComponents.motherboard || !selectedComponents.gpu || !selectedComponents.cpu) {
            throw new Error('Please select motherboard, GPU, and CPU first');
          }
          // const mbForPSU = await Motherboard.findById(selectedComponents.motherboard);
          //const selectedCase = await Case.findById(selectedComponents.case);
          return await PSU.find({
            // formFactor: mbForPSU.form,
            // wattage: { $gte: calculateRequiredWattage(selectedComponents) }  edit in database
          }).select('title imageUrl price');
        case 'cooling':
          if (!selectedComponents.cpu) {
            throw new Error('Please select CPU first');
          }
          const cpuForCooling = await CPU.findById(selectedComponents.cpu);
          return await Cooler.find({
            compatible_cpu_sockets: cpuForCooling.socket,

          }).select('title imageUrl compatible_cpu_sockets');

        default:
          throw new Error(`Invalid component type: ${targetType}`);
      }
    } catch (err) {
      throw new Error(`Error getting components: ${err.message}`);
    }
  },


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

  checkCpuMotherboard: (cpu, motherboard) => {
    const mbsocket = motherboard.MB_socket
    const cpuchipset = cpu.MB_chipsets
    const mbchipset = motherboard.chipset
    const cpusocket = cpu.socket

    const isValid = cpusocket === mbsocket &&
      cpuchipset.includes(mbchipset);
      return{
       valid: isValid,
       message: isValid? 'CPU Compatible with motherboard' : 'CPU incompatible with motherboard'
      }
  },

  checkMotherboardCase: (motherboard, pCcase) => {
    const supportedMotherboards = pCcase.supported_motherboards
    const isValid = supportedMotherboards.includes(motherboard.MB_form);
   return{
      valid: isValid,
      message: isValid ? 'Case Compatible with Motherboard' : 'Case incompatible with Motherboard'
   };
  },

  checkMemoryMotherboard: (memory, motherboard) => {

    const memoryGeneration = memory.DDR_generation
    const motherboardMemory = motherboard.supported_memory
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
    const socketTypes = cooler.compatible_cpu_sockets
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
  memory.speed <= motherboard.maxMemorySpeed &&
 memory.modules <= motherboard.memorySlots
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





