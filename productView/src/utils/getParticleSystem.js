import * as THREE from 'three';

const _VS = `
uniform float pointMultiplier;

attribute float size;
attribute float angle;
attribute vec4 aColor;

varying vec4 vColor;
varying vec2 vAngle;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = size * pointMultiplier / gl_Position.w;

  vAngle = vec2(cos(angle), sin(angle));
  vColor = aColor;
}`;

const _FS = `
uniform sampler2D diffuseTexture;

varying vec4 vColor;
varying vec2 vAngle;

void main() {
  vec2 coords = (gl_PointCoord - 0.5) * mat2(vAngle.x, vAngle.y, -vAngle.y, vAngle.x) + 0.5;
  gl_FragColor = texture2D(diffuseTexture, coords) * vColor;
}`;


function getLinearSpline(lerp) {

  const points = [];
  const _lerp = lerp;

  function addPoint(t, d) {
    points.push([t, d]);
  }

  function getValueAt(t) {
    let p1 = 0;

    for (let i = 0; i < points.length; i++) {
      if (points[i][0] >= t) {
        break;
      }
      p1 = i;
    }

    const p2 = Math.min(points.length - 1, p1 + 1);

    if (p1 == p2) {
      return points[p1][1];
    }

    return _lerp(
      (t - points[p1][0]) / (
        points[p2][0] - points[p1][0]),
      points[p1][1], points[p2][1]);
  }
  return { addPoint, getValueAt };
}

function getParticleSystem(params) {
  const { camera, emitter, parent, rate, texture } = params;
  const uniforms = {
    diffuseTexture: { 
      value: new THREE.TextureLoader().load(texture)
    },
    pointMultiplier: {
      value: window.innerHeight / (2.0 * Math.tan(30.0 * Math.PI / 180.0))
    }
  };
  const _material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: _VS,
    fragmentShader: _FS,
    depthTest: true,
    depthWrite: false,
    transparent: true,
    vertexColors: true
  });

  let _particles = [];
  let currentRate = rate; // Track current emission rate
  let bouncingParticles = 0; // Count particles that have started bouncing

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute([], 3));
  geometry.setAttribute('size', new THREE.Float32BufferAttribute([], 1));
  geometry.setAttribute('aColor', new THREE.Float32BufferAttribute([], 4));
  geometry.setAttribute('angle', new THREE.Float32BufferAttribute([], 1));

  const _points = new THREE.Points(geometry, _material);

  parent.add(_points);

  // Expose the points object for visibility control
  function getPoints() {
    return _points;
  }
  // Enhanced alpha spline for better fade-out effect
  const alphaSpline = getLinearSpline((t, a, b) => {
    return a + t * (b - a);
  });
  alphaSpline.addPoint(0.0, 1.0);
  alphaSpline.addPoint(0.3, 1.0);
  alphaSpline.addPoint(0.7, 0.8);
  alphaSpline.addPoint(0.9, 0.3);
  alphaSpline.addPoint(1.0, 0.0); // Complete fade to transparent

  const colorSpline = getLinearSpline((t, a, b) => {
    const c = a.clone();
    return c.lerp(b, t);
  });

  colorSpline.addPoint(0.0, new THREE.Color(0xc7eff9));
  colorSpline.addPoint(1.0, new THREE.Color(0xc7eff9));

  const sizeSpline = getLinearSpline((t, a, b) => {
    return a + t * (b - a);
  });
  sizeSpline.addPoint(0.0, 0.0);
  sizeSpline.addPoint(0.6, 0.1);
  sizeSpline.addPoint(1.0, 0.3);

  const radius = 0.002; // Much smaller radius for tighter spawn area
  const maxLife = 2.5; // Increased life for floor spreading
  const maxSize = 0.5;
  const floorY = -0.6; // Floor position from original
  const bounceDamping = 0.05; // 5% bounce velocity (changed from 0.4)
  const velocityReduction = 0.95; // 5% velocity reduction on floor contact
  const lifeReduction = 0.3; // 50% life reduction when bouncing starts
  const minBounceVelocity = 0.03; // Lower minimum velocity to bounce
  const spreadForce = 1.2; // Force for particle spreading on bounce
  const floorFriction = 0.95; // Friction coefficient for floor particles
  
  let gdfsghk = 0.0;
  
  function _AddParticles(timeElapsed) {
    gdfsghk += timeElapsed;
    const n = Math.floor(gdfsghk * currentRate);
    gdfsghk -= n / currentRate;
    for (let i = 0; i < n; i += 1) {
      const life = (Math.random() * 0.75 + 0.25) * maxLife;
      
      // Get exact emitter world position
      const emitterWorldPosition = new THREE.Vector3();
      emitter.getWorldPosition(emitterWorldPosition);
      
      _particles.push({
        // Start particles exactly at emitter position with minimal random offset
        position: new THREE.Vector3(
          emitterWorldPosition.x + (Math.random() * 2 - 1) * radius,
          emitterWorldPosition.y + (Math.random() * 2 - 1) * radius,
          emitterWorldPosition.z + (Math.random() * 2 - 1) * radius
        ),
        size: (Math.random() * 0.5 + 0.5) * maxSize,
        colour: new THREE.Color(),
        alpha: 1.0,
        life: life,
        maxLife: life,
        originalMaxLife: life, // Store original max life for life reduction calculation
        rotation: Math.random() * 2.0 * Math.PI,
        rotationRate: Math.random() * 0.01 - 0.005,
        velocity: new THREE.Vector3(-0.4, 0, 1),
        bounceCount: 0, // Track number of bounces
        onFloor: false, // Track if particle is on floor
        floorTime: 0, // Time spent on floor
        hasBounced: false, // Track if particle has ever bounced
        lifeReduced: false, // Track if life has been reduced
        fadeOutRate: 1.0, // Individual fade-out multiplier
      });
    }
  }

  function _UpdateGeometry() {
    const positions = [];
    const sizes = [];
    const colours = [];
    const angles = [];

    for (let p of _particles) {
      positions.push(p.position.x, p.position.y, p.position.z);
      colours.push(p.colour.r, p.colour.g, p.colour.b, p.alpha);
      sizes.push(p.currentSize);
      angles.push(p.rotation);
    }

    geometry.setAttribute(
      'position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute(
      'size', new THREE.Float32BufferAttribute(sizes, 1));
    geometry.setAttribute(
      'aColor', new THREE.Float32BufferAttribute(colours, 4));
    geometry.setAttribute(
      'angle', new THREE.Float32BufferAttribute(angles, 1));

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.size.needsUpdate = true;
    geometry.attributes.aColor.needsUpdate = true;
    geometry.attributes.angle.needsUpdate = true;
  }
  _UpdateGeometry();

  function _UpdateParticles(timeElapsed) {
    // Count bouncing particles for rate adjustment
    let newBouncingCount = 0;
    
    for (let p of _particles) {
      p.life -= timeElapsed;
      if (p.hasBounced) {
        newBouncingCount++;
      }
    }

    // Adjust emission rate based on bouncing particles (1% reduction when bouncing starts)
    const bouncingRatio = Math.min(newBouncingCount / Math.max(_particles.length, 1), 1);
    currentRate = rate * (1 - bouncingRatio * 0.01); // 1% reduction
    bouncingParticles = newBouncingCount;

    _particles = _particles.filter(p => {
      return p.life > 0.0;
    });

    for (let p of _particles) {
      const t = 1.0 - p.life / p.maxLife;
      p.rotation += p.rotationRate;
      
      // Enhanced fade-out calculation
      let baseAlpha = alphaSpline.getValueAt(t);
      
      // Additional fade-out for floor particles
      if (p.onFloor && p.floorTime > 1.0) {
        const floorFadeTime = p.floorTime - 1.0;
        const floorFadeFactor = Math.max(0, 1 - floorFadeTime * 0.8);
        baseAlpha *= floorFadeFactor;
      }
      
      // Apply individual fade-out rate
      p.alpha = baseAlpha * p.fadeOutRate;
      
      p.currentSize = p.size * sizeSpline.getValueAt(t);
      p.colour.copy(colorSpline.getValueAt(t));

      // Store previous position for collision detection
      const prevPosition = p.position.clone();
      
      // Update position
      p.position.add(p.velocity.clone().multiplyScalar(timeElapsed));

      // Floor collision detection and behavior
      if (p.position.y <= floorY && prevPosition.y > floorY && !p.onFloor) {
        // Particle just hit the floor
        p.position.y = floorY; // Snap to floor level
        p.onFloor = true;
        p.floorTime = 0;
        
        // Mark as bounced for rate calculation and apply life reduction
        if (!p.hasBounced) {
          p.hasBounced = true;
          
          // Reduce particle life by 50% when it starts bouncing
          if (!p.lifeReduced) {
            const remainingLife = p.life;
            const reducedLife = remainingLife * lifeReduction; // 50% reduction
            p.life = reducedLife;
            p.maxLife = p.maxLife * lifeReduction; // Also reduce maxLife for proper fade calculations
            p.lifeReduced = true;
            
            // Accelerate fade-out for life-reduced particles
            p.fadeOutRate = 0.7;
          }
        }
        
        // Apply 5% velocity reduction on floor contact
        p.velocity.multiplyScalar(velocityReduction);
        
        // Bounce with only 5% of velocity
        if (Math.abs(p.velocity.y) > minBounceVelocity && p.bounceCount < 2) {
          p.velocity.y = -p.velocity.y * bounceDamping; // 5% bounce velocity
          p.bounceCount++;
          
          // Add random spread on bounce (also reduced by 5%)
          const spreadX = (Math.random() - 0.5) * spreadForce * velocityReduction;
          const spreadZ = (Math.random() - 0.5) * spreadForce * velocityReduction;
          p.velocity.x += spreadX;
          p.velocity.z += spreadZ;
          
          // Further accelerate fade-out for bouncing particles
          p.fadeOutRate *= 0.8;
        } else {
          // Stop bouncing, start floor behavior
          p.velocity.y = 0;
          
          // Add reduced random spread when settling on floor
          const spreadAngle = Math.random() * Math.PI * 2;
          const spreadMagnitude = Math.random() * spreadForce * velocityReduction * 1.5;
          p.velocity.x = Math.cos(spreadAngle) * spreadMagnitude;
          p.velocity.z = Math.sin(spreadAngle) * spreadMagnitude;
          
          // Accelerate fade-out for settled particles
          p.fadeOutRate *= 0.6;
        }
      }

      // Floor behavior - slow down and spread
      if (p.onFloor) {
        p.floorTime += timeElapsed;
        
        // Keep particle on floor
        p.position.y = floorY;
        
        // Apply strong friction to slow down movement
        p.velocity.x *= Math.pow(floorFriction, timeElapsed * 60); // Frame-rate independent friction
        p.velocity.z *= Math.pow(floorFriction, timeElapsed * 60);
        
        // Add occasional random impulses for more natural spreading (reduced by 5%)
        if (Math.random() < 0.02) { // 2% chance per frame
          const impulseAngle = Math.random() * Math.PI * 2;
          const impulseMagnitude = Math.random() * 0.1 * velocityReduction;
          p.velocity.x += Math.cos(impulseAngle) * impulseMagnitude;
          p.velocity.z += Math.sin(impulseAngle) * impulseMagnitude;
        }
        
        // Gradually reduce velocity to simulate settling
        const settleRate = Math.max(0, 1 - p.floorTime * 0.5);
        p.velocity.x *= settleRate;
        p.velocity.z *= settleRate;
        
        // Accelerate fade-out based on floor time and life reduction
        if (p.floorTime > 0.5) {
          const floorFadeMultiplier = p.lifeReduced ? 0.4 : 0.3; // Faster fade for life-reduced particles
          p.fadeOutRate *= Math.max(0.1, 1 - p.floorTime * floorFadeMultiplier);
        }
        
        // Ensure particle doesn't move below floor
        p.velocity.y = 0;
      } else {
        // Apply gravity and drag for airborne particles
        const drag = p.velocity.clone();
        drag.multiplyScalar(timeElapsed * 0.2);
        drag.x = Math.sign(p.velocity.x) * Math.min(Math.abs(drag.x), Math.abs(p.velocity.x));
        drag.y = 0.015; // Gravity effect
        drag.z = Math.sign(p.velocity.z) * Math.min(Math.abs(drag.z), Math.abs(p.velocity.z));
        p.velocity.sub(drag);
      }

      // Prevent particles from going below floor
      if (p.position.y < floorY) {
        p.position.y = floorY;
        p.onFloor = true;
      }
      
      // Enhanced fade-out for very old particles, especially life-reduced ones
      if (t > 0.8) {
        const ageFadeMultiplier = p.lifeReduced ? 0.9 : 0.95; // Faster fade for life-reduced particles
        p.fadeOutRate *= ageFadeMultiplier; // Accelerate fade-out in final 20% of life
      }
    }

    _particles.sort((a, b) => {
      const d1 = camera.position.distanceTo(a.position);
      const d2 = camera.position.distanceTo(b.position);

      if (d1 > d2) {
        return -1;
      }
      if (d1 < d2) {
        return 1;
      }
      return 0;
    });
  }

  function update(timeElapsed) {
    if (timeElapsed > 0) {
      _AddParticles(timeElapsed);
      _UpdateParticles(timeElapsed);
      _UpdateGeometry();
    }
  }

  function clearParticles() {
    // Clear all existing particles
    _particles = [];
    // Reset emission timing
    gdfsghk = 0.0;
    // Update geometry to reflect empty particle array
    _UpdateGeometry();
    console.log('Particle system cleared - starting fresh');
  }

  return { update, _points, clearParticles };
}

export { getParticleSystem };