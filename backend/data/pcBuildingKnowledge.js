/**
 * PC Building Knowledge Base
 * This file contains information about PC building concepts, compatibility rules, and best practices.
 * This knowledge will be used by the RAG model to provide accurate and helpful responses.
 */

const pcBuildingKnowledge = {
  // General PC Building Concepts
  concepts: [
    {
      id: "pc-basics",
      title: "PC Building Basics",
      content: `
        Building a PC involves selecting compatible components and assembling them correctly.
        The main components of a PC are:
        - CPU (Central Processing Unit): The brain of the computer
        - Motherboard: The main circuit board that connects all components
        - RAM (Random Access Memory): Temporary memory for running applications
        - GPU (Graphics Processing Unit): Handles graphics rendering
        - Storage: HDD or SSD for storing data
        - PSU (Power Supply Unit): Provides power to all components
        - Case: Houses all components
        - Cooling: Keeps components at optimal temperatures
      `
    },
    {
      id: "compatibility",
      title: "Component Compatibility",
      content: `
        Ensuring compatibility between components is crucial for a successful build.
        Key compatibility considerations:
        - CPU and Motherboard: Must have matching sockets (e.g., AM4, LGA1200)
        - RAM and Motherboard: Must have matching memory types (DDR4, DDR5) and speeds
        - GPU and Case: Must fit within the case dimensions
        - PSU and Components: Must provide sufficient wattage for all components
        - Cooling and CPU: Must be compatible with the CPU socket
      `
    },
    {
      id: "budget-considerations",
      title: "Budget Considerations",
      content: `
        When building a PC on a budget, consider these tips:
        - Prioritize components based on your primary use case (gaming, productivity, etc.)
        - For gaming, allocate more budget to GPU and CPU
        - For productivity, prioritize CPU, RAM, and storage
        - Consider future upgradeability when selecting components
        - Look for sales and deals on components
        - Consider used or refurbished components for non-critical parts
      `
    }
  ],

  // Component-Specific Information
  components: {
    cpu: [
      {
        id: "cpu-basics",
        title: "CPU Basics",
        content: `
          The CPU (Central Processing Unit) is the brain of the computer.
          Key CPU specifications:
          - Cores: Number of processing units (more cores = better multitasking)
          - Threads: Number of simultaneous tasks (hyperthreading doubles threads)
          - Clock Speed: Processing speed in GHz (higher = faster)
          - Cache: Fast memory for frequently accessed data
          - Socket: Must match motherboard socket
          - Power Consumption: Measured in watts (TDP)
        `
      },
      {
        id: "cpu-selection",
        title: "CPU Selection Guide",
        content: `
          How to choose a CPU:
          - For gaming: Focus on single-core performance
          - For productivity: More cores and threads are beneficial
          - For budget builds: Consider previous generation CPUs
          - For high-end builds: Latest generation with highest core count
          - Always check compatibility with motherboard socket
        `
      }
    ],
    gpu: [
      {
        id: "gpu-basics",
        title: "GPU Basics",
        content: `
          The GPU (Graphics Processing Unit) handles graphics rendering.
          Key GPU specifications:
          - VRAM: Video memory (more = better for high resolutions)
          - Clock Speed: Processing speed (higher = faster)
          - CUDA Cores/Stream Processors: Parallel processing units
          - Power Consumption: Measured in watts
          - Physical Size: Must fit in case
          - Power Connectors: Must match PSU capabilities
        `
      },
      {
        id: "gpu-selection",
        title: "GPU Selection Guide",
        content: `
          How to choose a GPU:
          - For gaming: Focus on VRAM and performance for your target resolution
          - For productivity: Integrated graphics may be sufficient
          - For content creation: Consider workstation GPUs
          - For budget builds: Previous generation or mid-range models
          - Always check power requirements and physical dimensions
        `
      }
    ],
    motherboard: [
      {
        id: "motherboard-basics",
        title: "Motherboard Basics",
        content: `
          The motherboard connects all components.
          Key motherboard specifications:
          - Socket: Must match CPU socket
          - Chipset: Determines features and capabilities
          - RAM Slots: Number and type (DDR4, DDR5)
          - PCIe Slots: For expansion cards
          - SATA Ports: For storage devices
          - USB Ports: For peripherals
          - Form Factor: Size (ATX, mATX, ITX)
        `
      },
      {
        id: "motherboard-selection",
        title: "Motherboard Selection Guide",
        content: `
          How to choose a motherboard:
          - Match socket with CPU
          - Consider features needed (WiFi, Bluetooth, etc.)
          - Check RAM compatibility
          - Ensure enough expansion slots
          - Match form factor with case
          - Consider future upgradeability
        `
      }
    ],
    ram: [
      {
        id: "ram-basics",
        title: "RAM Basics",
        content: `
          RAM (Random Access Memory) provides temporary storage for running applications.
          Key RAM specifications:
          - Capacity: Amount of memory (8GB, 16GB, 32GB, etc.)
          - Speed: Measured in MHz (higher = faster)
          - Type: DDR4, DDR5, etc.
          - Latency: CAS latency (lower = better)
          - Channels: Single, dual, or quad channel
        `
      },
      {
        id: "ram-selection",
        title: "RAM Selection Guide",
        content: `
          How to choose RAM:
          - For gaming: 16GB is recommended, focus on speed
          - For productivity: 32GB+ may be beneficial
          - Match type with motherboard (DDR4, DDR5)
          - Consider dual-channel configuration
          - Check compatibility with CPU and motherboard
        `
      }
    ],
    storage: [
      {
        id: "storage-basics",
        title: "Storage Basics",
        content: `
          Storage devices store your data.
          Types of storage:
          - HDD (Hard Disk Drive): Mechanical, slower, larger capacity, cheaper
          - SSD (Solid State Drive): Electronic, faster, smaller capacity, more expensive
          - NVMe SSD: Fastest, connects via PCIe
          - SATA SSD: Fast, connects via SATA
        `
      },
      {
        id: "storage-selection",
        title: "Storage Selection Guide",
        content: `
          How to choose storage:
          - For OS and applications: SSD or NVMe SSD
          - For large files: HDD or large SSD
          - For gaming: SSD or NVMe SSD for faster loading
          - For budget builds: Small SSD + HDD combination
          - Consider future storage needs
        `
      }
    ],
    psu: [
      {
        id: "psu-basics",
        title: "PSU Basics",
        content: `
          The PSU (Power Supply Unit) provides power to all components.
          Key PSU specifications:
          - Wattage: Total power output
          - Efficiency: 80+ certification (Bronze, Silver, Gold, Platinum, Titanium)
          - Modularity: Non-modular, semi-modular, fully modular
          - Form Factor: ATX, SFX, etc.
          - Connectors: Must match component requirements
        `
      },
      {
        id: "psu-selection",
        title: "PSU Selection Guide",
        content: `
          How to choose a PSU:
          - Calculate total power needs of all components
          - Add 20-30% headroom for future upgrades
          - Consider efficiency for long-term savings
          - Check connector types needed
          - Match form factor with case
          - Choose reputable brands for reliability
        `
      }
    ],
    case: [
      {
        id: "case-basics",
        title: "Case Basics",
        content: `
          The case houses all components.
          Key case specifications:
          - Form Factor: ATX, mATX, ITX, etc.
          - Dimensions: Must fit all components
          - Cooling: Fan mounts and airflow
          - Cable Management: Space for organizing cables
          - Front Panel: USB ports, audio jacks, etc.
          - Aesthetics: Design, RGB, etc.
        `
      },
      {
        id: "case-selection",
        title: "Case Selection Guide",
        content: `
          How to choose a case:
          - Match form factor with motherboard
          - Ensure enough space for all components
          - Consider cooling requirements
          - Check cable management features
          - Consider aesthetics and build quality
          - Ensure enough front panel connections
        `
      }
    ],
    cooling: [
      {
        id: "cooling-basics",
        title: "Cooling Basics",
        content: `
          Cooling keeps components at optimal temperatures.
          Types of cooling:
          - Air Cooling: Uses fans and heatsinks
          - Liquid Cooling: Uses liquid to transfer heat
          - Passive Cooling: No moving parts, limited performance
          Key specifications:
          - TDP: Thermal Design Power (heat output)
          - Noise Level: Measured in dB
          - Size: Must fit in case
          - Compatibility: Must match CPU socket
        `
      },
      {
        id: "cooling-selection",
        title: "Cooling Selection Guide",
        content: `
          How to choose cooling:
          - Match TDP with CPU
          - Consider noise level preferences
          - Check compatibility with case and CPU
          - For overclocking: Consider high-performance cooling
          - For quiet builds: Focus on low noise ratings
          - For budget builds: Stock cooler may be sufficient
        `
      }
    ]
  },

  // Build Types and Recommendations
  buildTypes: [
    {
      id: "budget-gaming",
      title: "Budget Gaming PC",
      content: `
        A budget gaming PC focuses on maximizing gaming performance at a lower cost.
        Recommended components:
        - CPU: Mid-range AMD Ryzen or Intel Core
        - GPU: Mid-range graphics card (e.g., RTX 3060, RX 6600)
        - RAM: 16GB DDR4
        - Storage: 500GB SSD + 1TB HDD
        - PSU: 550W 80+ Bronze
        - Case: Mid-tower with good airflow
        - Cooling: Stock CPU cooler + case fans
        Budget range: $600-$800
      `
    },
    {
      id: "mid-range-gaming",
      title: "Mid-Range Gaming PC",
      content: `
        A mid-range gaming PC offers good performance for most games at 1080p/1440p.
        Recommended components:
        - CPU: High-end AMD Ryzen or Intel Core
        - GPU: High-end graphics card (e.g., RTX 3070, RX 6700 XT)
        - RAM: 16GB DDR4/32GB DDR4
        - Storage: 1TB NVMe SSD + 2TB HDD
        - PSU: 650W 80+ Gold
        - Case: Mid-tower with good airflow and cable management
        - Cooling: Aftermarket air cooler or 240mm AIO
        Budget range: $1000-$1500
      `
    },
    {
      id: "high-end-gaming",
      title: "High-End Gaming PC",
      content: `
        A high-end gaming PC delivers maximum performance for gaming at 1440p/4K.
        Recommended components:
        - CPU: Top-tier AMD Ryzen or Intel Core
        - GPU: Top-tier graphics card (e.g., RTX 4080, RX 7900 XT)
        - RAM: 32GB DDR4/64GB DDR4
        - Storage: 2TB NVMe SSD + 4TB HDD
        - PSU: 850W 80+ Platinum
        - Case: Full-tower with premium features
        - Cooling: 360mm AIO or high-end air cooler
        Budget range: $2000-$3000+
      `
    },
    {
      id: "productivity",
      title: "Productivity PC",
      content: `
        A productivity PC focuses on tasks like video editing, 3D rendering, and multitasking.
        Recommended components:
        - CPU: High-core-count AMD Ryzen or Intel Core
        - GPU: Workstation GPU or high-end gaming GPU
        - RAM: 32GB/64GB DDR4
        - Storage: 2TB NVMe SSD + 4TB HDD
        - PSU: 750W 80+ Gold
        - Case: Mid-tower with good airflow
        - Cooling: Aftermarket air cooler or 240mm AIO
        Budget range: $1500-$2500
      `
    },
    {
      id: "budget-productivity",
      title: "Budget Productivity PC",
      content: `
        A budget productivity PC handles basic productivity tasks efficiently.
        Recommended components:
        - CPU: Mid-range AMD Ryzen or Intel Core
        - GPU: Integrated graphics or entry-level discrete GPU
        - RAM: 16GB DDR4
        - Storage: 500GB SSD + 1TB HDD
        - PSU: 450W 80+ Bronze
        - Case: Mid-tower with basic features
        - Cooling: Stock CPU cooler
        Budget range: $500-$800
      `
    }
  ]
};

module.exports = pcBuildingKnowledge; 