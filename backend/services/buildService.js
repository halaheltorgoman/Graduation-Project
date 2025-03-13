// backend/services/buildService.js
const CPU = require('../models/Components/CPU');
const GPU = require('../models/Components/GPU');
const Motherboard = require('../models/Components/MotherBoard');
const Case = require('../models/Components/Case');
const Memory = require('../models/Components/Memory');
const Storage = require('../models/Components/Storage');
const PSU = require('../models/Components/PSU');
const Cooler = require('../models/Components/Cooler');
const Fan = require('../models/Components/Fan');

const buildService = {
  // Get compatible components based on previous selections
  getCompatibleComponents: async (selectedComponents, targetType) => {
    try {
      switch(targetType.toLowerCase()) {
        case 'gpu':
          return await GPU.find({});
          
        case 'cpu':
          return await CPU.find({});
          
        case 'motherboard':
          const cpu = await CPU.findById(selectedComponents.cpu);
          const gpu = await GPU.findById(selectedComponents.gpu);
          return await Motherboard.find({
            socket: cpu.socket,
            supportedChipsets: cpu.chipset,
            expansionSlots: gpu.interface
          });

        case 'case':
          const motherboard = await Motherboard.findById(selectedComponents.motherboard);
          return await Case.find({
            supportedFormFactors: motherboard.formFactor
          });

        case 'memory':
          const mbForMemory = await Motherboard.findById(selectedComponents.motherboard);
          return await Memory.find({
            type: mbForMemory.memoryType,
            speed: { $lte: mbForMemory.maxMemorySpeed }
          });

        case 'storage':
          
          return await Storage.find({});

        case 'psu':
          const mbForPSU = await Motherboard.findById(selectedComponents.motherboard);
          //const selectedCase = await Case.findById(selectedComponents.case);
          return await PSU.find({
            formFactor: mbForPSU.psuFormFactor,
            wattage: { $gte: calculateRequiredWattage(selectedComponents) }
          });

        case 'cooling':
          const cpuForCooling = await CPU.findById(selectedComponents.cpu);
          return await Cooler.find({
            sockets: cpuForCooling.socket,
            tdpRating: { $gte: cpuForCooling.tdp }
          });

        case 'fans':
          const pcCase = await Case.findById(selectedComponents.case);
          return await Fan.find({
            size: { $in: pcCase.fanSizes }
          });

        default:
          throw new Error(`Invalid component type: ${targetType}`);
      }
    } catch (err) {
      throw new Error(`Error getting components: ${err.message}`);
    }
  },

  // Main compatibility checker
  checkCompatibility: async (components) => {
    try {
      const [
        cpu,
        motherboard,
        gpu,
        memory,
        pcCase,
        psu
      ] = await Promise.all([
        CPU.findById(components.cpu),
        Motherboard.findById(components.motherboard),
        GPU.findById(components.gpu),
        Memory.findById(components.memory),
        Case.findById(components.case),
        PSU.findById(components.psu)
      ]);

      // Check all compatibility aspects
      return (
        cpuXmb(cpu, motherboard) &&
        gpuXmb(gpu, motherboard) &&
        mbXmemory(motherboard, memory) &&
        mbXcase(motherboard, pcCase) &&
        psuWatt(psu, components)
      );
    } catch (err) {
      console.error("Error in compatibility checker:", err);
      throw err;
    }
  }
};

// Compatibility check functions
function cpuXmb(cpu, motherboard) {
  return (
    cpu.socket === motherboard.socket &&
    motherboard.supportedChipsets.includes(cpu.chipset)
  );
}

function gpuXmb(gpu, motherboard) {
  return motherboard.expansionSlots.some(slot => 
    slot.type === gpu.interfaceType && slot.version >= gpu.interfaceVersion
  );
}

function mbXmemory(motherboard, memory) {
  return (
    memory.type === motherboard.memoryType &&
    memory.speed <= motherboard.maxMemorySpeed &&
    memory.modules <= motherboard.memorySlots
  );
}

function mbXcase(motherboard, pcCase) {
  return pcCase.supportedFormFactors.includes(motherboard.formFactor);
}
//compatiblity of psu with all components
function psuWatt(psu, components) {
  const requiredWattage = calculateRequiredWattage(components);
  return (
    psu.wattage >= requiredWattage &&
    psu.connectors.cpu >= components.motherboard.cpuPowerConnectors &&
    psu.connectors.pcie >= components.gpu.powerConnectors
  );
}

// Helper function to calculate total power requirement
function calculateRequiredWattage(components) {
  // Implementation details would depend on your component specs
  const baseWattage = 100;
  const componentWattage = Object.values(components).reduce(
    (sum, component) => sum + (component.powerDraw || 0),
    baseWattage
  );
  return Math.ceil(componentWattage * 1.2); // Add 20% buffer
}

module.exports = buildService;