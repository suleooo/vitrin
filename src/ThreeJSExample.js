import React, { useCallback, useEffect, useRef } from "react";
import * as THREE from "three/build/three.module.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import table8 from "./assets/dress.glb";
import table5 from "./assets/model5.glb";
import table6 from "./assets/model6.glb";
import table7 from "./assets/model7.glb";
import table10 from "./assets/model10.glb";
import table13 from "./assets/model13.glb";
import table14 from "./assets/model122.glb";
import table15 from "./assets/model123.glb";
import "./styles.css";

import Image1 from "./assets/1.jpg";
import Image2 from "./assets/2.jpg";
import Image3 from "./assets/3.jpg";
import Image4 from "./assets/5.jpg";
import Image5 from "./assets/4.jpg";
import Image6 from "./assets/6.jpg";
import Image7 from "./assets/7.jpg";
import Image8 from "./assets/8.jpg";
import Image9 from "./assets/9.jpg";
import Image10 from "./assets/10.jpg";
import Image11 from "./assets/11.jpg";
import Image12 from "./assets/12.jpg";


let container, camera, scene, renderer, orbitControls, modelSelector, textureSelector, colorSelector;
const materials = {};  // Store materials for each mesh

const setupScene = () => {
  scene = new THREE.Scene();
};

const setupCamera = () => {
  camera = new THREE.PerspectiveCamera(20, container.offsetWidth / container.offsetHeight, 1e-5, 1e10);
  scene.add(camera);
};

const setupLights = () => {
  const hemispheric = new THREE.HemisphereLight(0xffffff, 0x222222, 1);
  scene.add(hemispheric);
};

const setupRenderer = () => {
  renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
  renderer.setClearColor(0xffffff);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(renderer.domElement);
};

const loadModel = (modelPath) => {
  const loader = new GLTFLoader();
  loader.load(modelPath, (gltf) => {
    const object = gltf.scene;
    setupModel(object);
    scene.add(object);
    setupOrbitControls();  // OrbitControls are initialized here
    onWindowResize(); // Initial resizing on load
  });
};

const setupModel = (object) => {
  object.updateMatrixWorld();
  const boundingBox = new THREE.Box3().setFromObject(object);
  const modelSizeVec3 = new THREE.Vector3();
  boundingBox.getSize(modelSizeVec3);
  const modelSize = modelSizeVec3.length();
  const modelCenter = new THREE.Vector3();
  boundingBox.getCenter(modelCenter);

  object.position.x = -modelCenter.x;
  object.position.y = -modelCenter.y;
  object.position.z = -modelCenter.z;
  camera.position.copy(modelCenter);
  camera.position.x += modelSize * -0.2;
  camera.position.y += modelSize * 0.4;
  camera.position.z += modelSize * 3.5;
  camera.near = modelSize / 100;
  camera.far = modelSize * 100;
  camera.updateProjectionMatrix();
  camera.lookAt(modelCenter);

  // Clear previous materials
  for (let key in materials) {
    delete materials[key];
  }

  // Traverse object and store materials for each mesh
  object.traverse((obj) => {
    if (obj.isMesh) {
      console.log("Mesh name:", obj.name);  // Print mesh names to console
      materials[obj.name] = obj.material;
    }
  });

  // Apply current texture and color to the new materials
  const currentTexture = convertImageToTexture(textureSelector.value);
  const currentColor = colorSelector.value;
  for (let key in materials) {
    materials[key].map = currentTexture;
    materials[key].color.set(currentColor);
    materials[key].needsUpdate = true;
  }
};

const setupOrbitControls = () => {
  orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.reset();
  orbitControls.maxDistance = 50;
  orbitControls.enableDamping = true;
  orbitControls.dampingFactor = 0.07;
  orbitControls.rotateSpeed = 1.25;
  orbitControls.panSpeed = 1.25;
  orbitControls.screenSpacePanning = true;
  orbitControls.autoRotate = true;
};

const onWindowResize = () => {
  camera.aspect = container.offsetWidth / container.offsetHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

const convertImageToTexture = (image) => {
  const textureLoader = new THREE.TextureLoader();
  let texture = textureLoader.load(image);
  texture.encoding = THREE.sRGBEncoding;
  texture.flipY = false;
  return texture;
};

const init = (modelPath) => {
  setupScene();
  setupCamera();
  setupLights();
  setupRenderer();
  loadModel(modelPath);
};

const ThreeJSExample = () => {
  const animate = useCallback(() => {
    requestAnimationFrame(animate);
    if (orbitControls) orbitControls.update();  // Check if orbitControls exist
    renderer.render(scene, camera);
  }, []);

  const ref = useRef(null);
  const modelRef = useRef(null);
  const textureRef = useRef(null);
  const colorRef = useRef(null);

  useEffect(() => {
    container = ref.current;
    modelSelector = modelRef.current;
    textureSelector = textureRef.current;
    colorSelector = colorRef.current;

    const savedModel = sessionStorage.getItem("selectedModel") || table5;
    modelSelector.value = savedModel;

    const savedTexture = sessionStorage.getItem("selectedTexture") || Image1;
    const savedColor = sessionStorage.getItem("selectedColor") || "#ffffff";

    textureSelector.value = savedTexture;
    colorSelector.value = savedColor;

    const resizeHandler = () => onWindowResize();

    init(savedModel);
    animate();

    window.addEventListener("resize", resizeHandler, false);

    // Update model on selection change
    modelSelector.addEventListener("change", (event) => {
      const selectedModel = event.target.value;
      sessionStorage.setItem("selectedModel", selectedModel);
      window.location.reload();
    });

    // Add event listeners for texture and color selections
    const textureRadios = document.querySelectorAll('input[name="texture"]');
    textureRadios.forEach((radio) => {
      radio.addEventListener("change", (event) => {
        const texture = convertImageToTexture(event.target.value);
        for (let key in materials) {
          materials[key].map = texture;
          materials[key].needsUpdate = true;
        }
        sessionStorage.setItem("selectedTexture", event.target.value);
      });
    });

    colorSelector.addEventListener("input", (event) => {
      const color = event.target.value;
      for (let key in materials) {
        materials[key].color.set(color);
        materials[key].needsUpdate = true;
      }
      sessionStorage.setItem("selectedColor", color);
    });

    return () => {
      window.removeEventListener("resize", resizeHandler, false);
    };
  }, [animate]);

  return (
    
    
   <div className="preview">
      <div className="ref" ref={ref}/>

      <div className="controls">
        <div className="model">
          <p>Model</p>
          <select id="modelSelector" ref={modelRef}>
            <option value={table5}>Elbise</option>
            <option value={table6}>Elbise</option>
            <option value={table7}>Elbise</option>
            <option value={table8}>Elbise</option>
            <option value={table10}>Elbise</option>
            <option value={table13}>Elbise</option>
            <option value={table15}>Elbise</option>
            <option value={table14}>Elbise</option>
          </select>
        </div>
        <div className="texture">
          <p>Texture</p>
          <div  ref={textureRef}>
            <label>
              <img src={Image1} alt="Image 1" className="image-preview" />
              <input type="radio" name="texture" value={Image1} hidden defaultChecked />
            
            </label>
            <label>
              <img src={Image2} alt="Image 2" className="image-preview" />
              <input type="radio" name="texture" value={Image2}  hidden/>
        
            </label>
            <label>
              <img src={Image3} alt="Image 3" className="image-preview" />
              <input type="radio" name="texture" value={Image3} hidden />
            
            </label>
            <label>
              <img src={Image4} alt="Image 4" className="image-preview" />
              <input type="radio" name="texture" value={Image4} hidden />
              
            </label>
            <label>
              <img src={Image5} alt="Image 5" className="image-preview" />
              <input type="radio" name="texture" value={Image5} hidden />
            
            </label>
            <label>
              <img src={Image6} alt="Image 6" className="image-preview" />
              <input type="radio" name="texture" value={Image6} hidden/>
           
            </label>
            <label>
              <img src={Image7} alt="Image 7" className="image-preview" />
              <input type="radio" name="texture" value={Image7} hidden />
              
            </label>
            <label>
              <img src={Image8} alt="Image 8" className="image-preview" />
              <input type="radio" name="texture" value={Image8} hidden />
             
            </label>
            <label>
              <img src={Image9} alt="Image 9" className="image-preview" />
              <input type="radio" name="texture" value={Image9} hidden />
          
            </label>
            <label>
              <img src={Image10} alt="Image 10" className="image-preview" />
              <input type="radio" name="texture" value={Image10} hidden />
              
            </label>
            <label>
              <img src={Image11} alt="Image 11" className="image-preview" />
              <input type="radio" name="texture" value={Image11} hidden />
              
            </label>
            <label>
              <img src={Image12} alt="Image 12" className="image-preview"  />
              <input type="radio" name="texture" value={Image12} hidden />
           
            </label>
          </div>
        </div>
        <div className="color">
          <p>Color</p>
          <input type="color" id="colorPicker" name="favcolor" defaultValue="#ffffff" ref={colorRef} />
        </div>
    </div>
    
  </div>
  );
};
export default ThreeJSExample;
