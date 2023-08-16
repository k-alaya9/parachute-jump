import {
  Mesh, 
   TextureLoader,
   SphereGeometry,
   MeshBasicMaterial,
   BackSide,
   BoxGeometry,
   RepeatWrapping,
   CubeTextureLoader,
   Color
   
} from "three"; 
import scene from'./main.js';
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

class World {
    constructor() {

    }
  
    getTemperature(high) {
      let standardTemperature = 288.15;
      let l = 0.0065;
  
      let temperature = standardTemperature - l * high;
      return temperature;
    }
  
    calculatePressure(high) {
      let standardPressure = 101325;
      let standardTemperature = 288.15;
      let g = 9.81; // gravity
      let M = 0.0289644; // mol mass
      let l = 0.0065; // change in temp
      let R = 8.341;
      let exponent = (g * M) / (R * l);
      let basis = 1 - l * high / standardTemperature;
      let pressure = standardPressure * Math.pow(basis, exponent);
      return pressure;
    }
  
    calculateAirDensity(pressure, temperature, high) {
      let standardTemperature = 288.15;
      let standardPressure = 101325;
      let standardDensity = 1.2250;
      let density =
        (standardDensity * pressure * standardTemperature) /
        (temperature * standardPressure);
      return density;
    }
  
    getRandomValue(min, max) {
      return Math.random() * (max - min) + min;
    }

   drawSkyBox(){
   // Create a sphere geometry
   const skydomeGeometry = new SphereGeometry(3000, 32, 32);

   // Load the texture for the skydome
   const skydomeTexture = new TextureLoader().load('textures/skydome2.jpg');

   // Create a material using the skydome texture
   const skydomeMaterial = new MeshBasicMaterial({
     map: skydomeTexture,
     side: BackSide // Ensure the texture is rendered on the inside of the sphere
   });
   // Create a mesh using the sphere geometry and material
   const skydome = new Mesh(skydomeGeometry, skydomeMaterial);
   skydome.position.set(0,3000,0);
   // Add the skydome to the scene
   scene.add(skydome);
  }
  drawClouds(X,height){
    // const obj=new OBJLoader();
    // const mtl=new MTLLoader();
    // mtl.load('textures/CloudCollection.mtl',(texture)=>{
    //   texture.preload();
    //   obj.setMaterials(texture);

    // });
    // obj.load('models/CloudCollection.obj',(object)=>{
    //   console.log('hi');
    //   object.position.set(X,height,X);
    //    object.scale.set(0.3,0.3,0.3);
    //   // object.rotation.x=Math.PI;
    //   scene.add(object);
    // });
    const loader=new GLTFLoader();
    loader.load('models/cloud/cloud.gltf',(object)=>
    {
        const model=object.scene;
        model.position.set(X,height+3000,X);
        model.scale.set(50,50,50);
        scene.add(model);
    }
    );
  }
}

  export default World;