export interface ProductConfig {
  // Product Information
  product: {
    name: string;
    category: string;
    subcategory: string;
    description: string;
  };

  // 3D Model Configuration
  model: {
    path: string; // Path to GLB/GLTF file
    scale: [number, number, number];
    position: [number, number, number];
    rotation: [number, number, number];
    initialRotation?: {
      enabled: boolean;
      steps: number;
      increment: number;
    };
  };

  // Particle System Configuration
  particles: {
    enabled: boolean;
    systems: Array<{
      name: string;
      type: 'spray' | 'mist' | 'smoke' | 'fire' | 'custom';
      position: [number, number, number];
      rate: number;
      texture: string;
      maxLife: number;
      velocity: [number, number, number];
      spread?: number;
      color?: string;
    }>;
  };

  // Color Customization
  customization: {
    parts: Array<{
      name: string;
      label: string;
      defaultColor: string;
    }>;
    colors: Array<{
      name: string;
      value: string;
      type: 'color' | 'texture';
      texture?: string;
      shininess?: number;
      uvwMapping?: boolean;
    }>;
  };

  // Specifications
  specifications: {
    dimensions: {
      height: string;
      width: string;
      length: string;
    };
    technical: Array<{
      label: string;
      value: string;
    }>;
  };

  // Resources
  resources: {
    dimensionViews: {
      front?: string;
      top?: string;
      side?: string;
    };
    downloadLinks: Array<{
      label: string;
      url: string;
      type: 'pdf' | 'image' | 'video' | 'other';
    }>;
  };

  // Camera Settings
  cameras: {
    main: {
      position: [number, number, number];
      lookAt: [number, number, number];
      fov: number;
    };
    overhead: {
      position: [number, number, number];
      lookAt: [number, number, number];
      fov: number;
    };
  };

  // Lighting Configuration
  lighting: {
    hemisphere: {
      skyColor: string;
      groundColor: string;
      intensity: number;
      position: [number, number, number];
    };
    directional: {
      color: string;
      intensity: number;
      position: [number, number, number];
      castShadow: boolean;
    };
  };

  // Environment
  environment: {
    backgroundColor: string;
    fogColor: string;
    fogNear: number;
    fogFar: number;
    floor: {
      enabled: boolean;
      color: string;
      size: number;
    };
    grid: {
      enabled: boolean;
      size: number;
      divisions: number;
    };
  };
}

// Default Water Odyssey Configuration
export const waterOdysseyConfig: ProductConfig = {
  product: {
    name: "BLACK RHINO",
    category: "FunForms™",
    subcategory: "Sprayer",
    description: "Interactive water feature with customizable spray patterns"
  },

  model: {
    path: "/models/gltf/RHINO.glb",
    scale: [0.6, 0.6, 0.6],
    position: [0, -0.6, 0],
    rotation: [0, Math.PI + (70 * Math.PI / 180), 0],
    initialRotation: {
      enabled: true,
      steps: 35,
      increment: Math.PI / 90
    }
  },

  particles: {
    enabled: true,
    systems: [
      {
        name: "spray1",
        type: "spray",
        position: [-0.1, 0.47, 0.19],
        rate: 500.0,
        texture: "/img/light_01.png",
        maxLife: 2.5,
        velocity: [-0.4, 0, 1]
      },
      {
        name: "spray2",
        type: "spray",
        position: [-0.5, 0.47, 0],
        rate: 500.0,
        texture: "/img/light_01.png",
        maxLife: 2.5,
        velocity: [-0.4, 0, 1]
      },
      {
        name: "spray3",
        type: "spray",
        position: [0.3, 0.46, 0.265],
        rate: 500.0,
        texture: "/img/light_01.png",
        maxLife: 2.5,
        velocity: [-0.4, 0, 1]
      },
      {
        name: "mist1",
        type: "mist",
        position: [0.09, 0.46, -0.46],
        rate: 2500.0,
        texture: "/img/light_01.png",
        maxLife: 3.0,
        velocity: [0, 0.2, -0.8],
        spread: 0.4
      }
    ]
  },

  customization: {
    parts: [
      { name: "bucket1", label: "RHINO", defaultColor: "#0023FF" },
      { name: "handler1", label: "ROCK", defaultColor: "#8b7355" },
      { name: "handler3", label: "FLOOR", defaultColor: "#19BA1B" }
    ],
    colors: [
      { name: "Coral", value: "#D60000", type: "color" },
      { name: "Sky", value: "#00E4F3", type: "color" },
      { name: "Green", value: "#19BA1B", type: "color" },
      { name: "COLOR2", value: "color2_texture", type: "texture", texture: "/textures/COLOR2.jpg", shininess: 60 },
      { name: "COLOR3", value: "color3_texture", type: "texture", texture: "/textures/COLOR3.jpg", shininess: 60 },
      { name: "ROCK1", value: "ROCK1_texture", type: "texture", texture: "/textures/rhinotexture3.jpg", shininess: 20, uvwMapping: true },
      { name: "ROCK2", value: "ROCK2_texture", type: "texture", texture: "/textures/rhinotexture4.jpg", shininess: 20, uvwMapping: true },
      { name: "GRASS1", value: "GRASS1_texture", type: "texture", texture: "/textures/RHINO_GRASS5.jpg", shininess: 15, uvwMapping: true },
      { name: "GRASS2", value: "GRASS2_texture", type: "texture", texture: "/textures/RHINO_GRASS6.jpg", shininess: 15, uvwMapping: true }
    ]
  },

  specifications: {
    dimensions: {
      height: "14'-3\" (435 CM)",
      width: "5' (152 CM)",
      length: "10' (305 CM)"
    },
    technical: [
      { label: "Flow Requirements", value: "40 - 100 GPM / 152-379 LPM" },
      { label: "Category", value: "Fun Form Water Feature" },
      { label: "Material", value: "Fiberglass Composite" }
    ]
  },

  resources: {
    dimensionViews: {
      front: "/textures/rhinoFront.svg",
      top: "/textures/rhinoTop.svg",
      side: "/textures/rhinoSide.svg"
    },
    downloadLinks: [
      { label: "Download PDS", url: "Docu/massivesplash_ss_02.pdf", type: "pdf" }
    ]
  },

  cameras: {
    main: {
      position: [1.2, 0.03, 5],
      lookAt: [0, 0.03, 0],
      fov: 30
    },
    overhead: {
      position: [12, 1, -6],
      lookAt: [0, 0, 0],
      fov: 10
    }
  },

  lighting: {
    hemisphere: {
      skyColor: "#ffffff",
      groundColor: "#ffffff",
      intensity: 1,
      position: [0, 2, 2]
    },
    directional: {
      color: "#ffffff",
      intensity: 0.45,
      position: [0.5, 1, 1.5],
      castShadow: true
    }
  },

  environment: {
    backgroundColor: "#f1f1f1",
    fogColor: "#f1f1f1",
    fogNear: 20,
    fogFar: 100,
    floor: {
      enabled: true,
      color: "#F8F8F8",
      size: 5000
    },
    grid: {
      enabled: true,
      size: 50,
      divisions: 50
    }
  }
};

// Example configuration for a different product (Fire Feature)
export const fireFeatureConfig: ProductConfig = {
  product: {
    name: "FIRE DRAGON",
    category: "FireForms™",
    subcategory: "Flame Thrower",
    description: "Interactive fire feature with customizable flame patterns"
  },

  model: {
    path: "/models/gltf/DRAGON.glb",
    scale: [0.8, 0.8, 0.8],
    position: [0, -0.5, 0],
    rotation: [0, Math.PI, 0],
    initialRotation: {
      enabled: true,
      steps: 30,
      increment: Math.PI / 80
    }
  },

  particles: {
    enabled: true,
    systems: [
      {
        name: "flame1",
        type: "fire",
        position: [0, 0.8, 0.3],
        rate: 800.0,
        texture: "/img/fire.png",
        maxLife: 1.5,
        velocity: [0, 1.2, 0],
        color: "#ff4500"
      }
    ]
  },

  customization: {
    parts: [
      { name: "body", label: "DRAGON BODY", defaultColor: "#8B0000" },
      { name: "base", label: "BASE", defaultColor: "#2F4F4F" }
    ],
    colors: [
      { name: "Dark Red", value: "#8B0000", type: "color" },
      { name: "Gold", value: "#FFD700", type: "color" },
      { name: "Bronze", value: "#CD7F32", type: "color" }
    ]
  },

  specifications: {
    dimensions: {
      height: "12'-0\" (366 CM)",
      width: "6' (183 CM)",
      length: "8' (244 CM)"
    },
    technical: [
      { label: "Gas Requirements", value: "Natural Gas or Propane" },
      { label: "Category", value: "Fire Feature" },
      { label: "Material", value: "Steel Construction" }
    ]
  },

  resources: {
    dimensionViews: {
      front: "/textures/dragonFront.svg",
      top: "/textures/dragonTop.svg",
      side: "/textures/dragonSide.svg"
    },
    downloadLinks: [
      { label: "Download Specs", url: "docs/dragon_specs.pdf", type: "pdf" }
    ]
  },

  cameras: {
    main: {
      position: [1.5, 0.2, 6],
      lookAt: [0, 0.2, 0],
      fov: 35
    },
    overhead: {
      position: [10, 2, -5],
      lookAt: [0, 0, 0],
      fov: 15
    }
  },

  lighting: {
    hemisphere: {
      skyColor: "#ffaa44",
      groundColor: "#442200",
      intensity: 0.8,
      position: [0, 3, 2]
    },
    directional: {
      color: "#ffaa44",
      intensity: 0.6,
      position: [1, 2, 1],
      castShadow: true
    }
  },

  environment: {
    backgroundColor: "#1a1a2e",
    fogColor: "#1a1a2e",
    fogNear: 15,
    fogFar: 80,
    floor: {
      enabled: true,
      color: "#2F2F2F",
      size: 3000
    },
    grid: {
      enabled: true,
      size: 30,
      divisions: 30
    }
  }
};