// ============================================
// NixBoard Constants
// ============================================

// Card colors
const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#6366f1', // indigo
  '#14b8a6', // teal
];

// Theme configurations
const THEMES = {
  purple: { 
    bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)', 
    tagline: '#ffffff', 
    header: 'rgba(102, 126, 234, 0.15)', 
    glow: '102, 126, 234' 
  },
  ocean: { 
    bg: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #667eea 100%)', 
    tagline: '#ffffff', 
    header: 'rgba(30, 60, 114, 0.2)', 
    glow: '30, 60, 114' 
  },
  sunset: { 
    bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', 
    tagline: '#ffffff', 
    header: 'rgba(250, 112, 154, 0.15)', 
    glow: '250, 112, 154' 
  },
  forest: { 
    bg: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)', 
    tagline: '#ffffff', 
    header: 'rgba(19, 78, 94, 0.2)', 
    glow: '19, 78, 94' 
  },
  fire: { 
    bg: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)', 
    tagline: '#ffffff', 
    header: 'rgba(241, 39, 17, 0.15)', 
    glow: '241, 39, 17' 
  },
  ashes: { 
    bg: 'linear-gradient(135deg, #3c3c3c 0%, #8a8a8a 100%)', 
    tagline: '#ffffff', 
    header: 'rgba(60, 60, 60, 0.2)', 
    glow: '60, 60, 60' 
  },
  chrome: { 
    bg: 'linear-gradient(135deg, #8B0000 0%, #b22222 25%, #dc143c 50%, #ff4500 75%, #8B0000 100%)', 
    tagline: '#ffffff', 
    header: 'rgba(139, 0, 0, 0.4)', 
    glow: '255, 69, 0' 
  },
  darth: { 
    bg: 'linear-gradient(135deg, #1a0a0a 0%, #2d0a0a 25%, #0f0a0a 50%, #1a0a0a 75%, #2d0a0a 100%)', 
    tagline: '#ffffff', 
    header: 'rgba(40, 10, 10, 0.85)', 
    glow: '180, 30, 30', 
    cardBg: 'rgba(30, 20, 20, 0.9)', 
    text: '#e0d0d0' 
  },
  galaxy: { 
    bg: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)', 
    tagline: '#ffffff', 
    header: 'rgba(15, 12, 41, 0.6)', 
    glow: '138, 43, 226', 
    cardBg: 'rgba(40, 20, 80, 0.85)', 
    text: '#e0d4ff' 
  }
};

// Animation settings
const ANIMATION = {
  gradientDuration: '8s',
  gradientSize: '600% 600%',
  deloreanGlowTime: 300,
  deloreanFlashTime: 800,
  deloreanMinInterval: 5 * 60 * 1000,  // 5 minutes
  deloreanMaxInterval: 10 * 60 * 1000, // 10 minutes
};

// API settings
const API = {
  boardEndpoint: '/api/boards/1',
  codeEndpoint: '/api/generate-code',
};

// Export for use in other files
if (typeof window !== 'undefined') {
  window.NIXBOARD_CONSTANTS = {
    COLORS,
    THEMES,
    ANIMATION,
    API,
  };
}
