import {
  
  LineBasicMaterial,
    LineSegments,
    Mesh,
    MeshStandardMaterial,
    TextureLoader,
    Vector3,
    
} from "three"; 
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import {  TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import scene from'./main.js';

import TWEEN, { Tween } from "@tweenjs/tween.js";
import { WireframeGeometry } from "three";
class parachute{
    constructor(position,mass,world,initialVelocity, slopeAngle,A,open,selected){
      this.selected=selected;
        this.mass=mass;
        this.world=world;
        this.r=2;
        this.slopeAngle=slopeAngle;
        this.mesh=null;
        this.position=position;
        this.planeVel=initialVelocity.clone();
        this.A = A;
        this.hp=A;
        this.cd=1;
        this.vel =  initialVelocity.clone();
        this.acc = new Vector3(0,-9.8,0);
        this.elapsedTime = 0; // Initialize elapsed time to zero
        this.openParachute=open;
        this.v=this.vel.length();
        this.a=this.acc.length();
        this.fr= new Vector3().length();
        this.w=this.weghit().length();
        this.wind=10;
        this.parachuteDrawn = false;
        this.parachute = null;
        this.plane=null;
        this.h=position.y;
        this.drawPerson();
          }
    applyForce(force){
        // [a = F/m]
        var f = force.clone().divideScalar(this.mass);
        this.acc.add(f);
    }
    collision(){
        // check if parachute is below ground level
        if(this.mesh){
          if (this.mesh.position.y <= this.hp && this.openParachute===true) {
            this.mesh.position.setY(this.h);
            this.vel.y *=-1;    
          this.acc.set(0,0,0);  
          this.windforce.setLength(0);
          this.vel.setLength(0);   
        }
        if(this.mesh.position.y <=this.hp && this.openParachute!=true){
          this.vel.set(0,0,0);
          this.acc.set(0,0,0);
        // Create a text geometry and add it to the scene
        this.drawText();
        }
        }

}
update(deltaTime) {
  if(this.mesh&&this.plane){
    // Update the velocity based on the acceleration [v = v0*sin(teta) + (a*dt)]
    this.vel.add(this.acc.clone().multiplyScalar(deltaTime));
    this.h=this.mesh.position.y;
    this.v=this.vel.length();
    this.a=this.acc.length();
    this.fr=this.drag().length();
    this.w=this.weghit().length();
    this.wind=this.windforce().length();
    this.mesh.rotation.x=Math.PI*0.7;
    // Update the position based on the velocity [r = r0 + (v*dt)]
    this.mesh.position.add(this.vel.clone().multiplyScalar(deltaTime));
     this.windforce();

    // Update the position of the parachute object
    if (this.parachute &&this.parachuteDrawn) {
      this.parachute.position.copy(this.mesh.position);
      this.parachute.position.y=this.selected==='one'?this.mesh.position.y-40:this.mesh.position.y+160;
     var endPosition=this.mesh.rotation.x=0;
    }
    if(this.plane){
      this.plane.position.add(this.planeVel.clone().multiplyScalar(deltaTime));
    }
    // this.windforce();
    // Calculate the net force on the parachute
    const netForce = new Vector3()
      .copy(this.weghit())
      .add(this.drag());

     
      // update the acceleration based on the net force [a = F/m]
      const acceleration = netForce.divideScalar(this.mass);
      this.acc.copy(acceleration);
    
    this.elapsedTime +=deltaTime;
    // Check if 3 seconds have elapsed and set X-component of velocity to zero
    if (this.elapsedTime >= 3 &&this.elapsedTime <=4) {
      this.vel.setX(0);
    }
    if(this.elapsedTime>=1){
      this.planeVel.setX(100);
    }
    
    this.collision();
  }
  }


weghit(){
    var gravity = new Vector3(0, -9.8, 0);
    var w=gravity.clone().multiplyScalar(this.mass);
    this.applyForce(w);
    return w;
}
windforce() {
    const wind = new Vector3(
    this.wind,
      0,
      0
    );
    if(this.mesh){
      const temp = this.world.getTemperature(this.mesh.position.y);
      const pressure = this.world.calculatePressure(this.mesh.position.y);
      const p = this.world.calculateAirDensity(pressure, temp, this.mesh.position.y);
      const pi = p;
      const speedWind = wind.length();
      // wind.multiplyScalar(0.5 * this.A * pi * speedWind * speedWind);
      this.applyForce(wind);
    }
    return wind;
    // let N = 10, height = 0, Matrix = [];

    // for(let i = 0 ; i < N ; i++){    
    //     let windCurrent = {
    //         minHeight : height,
    //         maxHeight : height + Math.ceil (Math.random() * 10000), 
    //         windSpeed : Math.ceil (Math.random() * 500),
    //         Xangle :  Math.random() * 2 * Math.PI,
    //         Yangle :  Math.random() * 2 * Math.PI,
    //         Zangle :  Math.random() * 2 * Math.PI,
    //     }
    //     height = windCurrent.maxHeight;
    //     Matrix.push(windCurrent);
    // }
    // return height;
  }

drag() {
 if(this.mesh){
  const temp = this.world.getTemperature(this.mesh.position.y);
  const pressure = this.world.calculatePressure(this.mesh.position.y);
  const p = this.world.calculateAirDensity(pressure, temp, this.mesh.position.y);
  const pi = p;
  // c = (1/2 * A * pi * Cd)
  const c = (1 / 2) * this.A * pi * this.cd;

  // drag direction -v
  const dragDirection = this.vel.clone().normalize().negate();
  const speed = this.vel.length();
      // drag magnitude =  c * v2 
      const dragMagnitude = c * speed * speed;
      const dragForce = dragDirection.multiplyScalar(dragMagnitude);
      let equal = dragForce.length() >= this.weghit().length() ? true : false;
      if (equal && this.openParachute===true&& !this.parachuteDrawn) {
        console.log('hello world');
        if(this.selected==='one')
        this.cd = 0.77;
      else this.cd=0.75;
      if(this.selected!=='one')
         this.A = Math.PI * Math.pow(this.r,2);
        else
        this.A=8;
        const newC = 1 / 2 * this.A * pi * this.cd;
        const newDragMagnitude = newC * speed * speed;
        dragForce.setLength(newDragMagnitude);
        this.parachuteDrawn=true;
        scene.add(this.parachute);

      }
      this.applyForce(dragForce);
      this.fr=dragForce.length();
      return dragForce;
 }
  }
  drawParachute(){
    if(this.selected!=='one'){
      const loader=new GLTFLoader();
      loader.load('models/parachute.gltf',(object)=>{
        const model=object.scene;
        model.position.copy(this.mesh.position);
        model.scale.set(120, 120, 120);
        model.rotation.y=-Math.PI;
        this.parachute = model;
      });
    }
    else{
      const objLoader = new OBJLoader();
      objLoader.load('models/parashot.obj', (object) => {
        var opacity = 0;
        object.traverse(function(child) {
          if (child instanceof Mesh) {
            child.material.opacity = opacity;
          }
        });
        const wireframe= new WireframeGeometry(object.children[0].geometry);
        const material= new LineBasicMaterial({color: 'Black'});
        const wireframeobj= new LineSegments(wireframe,material);
        wireframeobj.renderOrder=1;
        object.add(wireframeobj);
        object.position.copy(this.mesh.position);
        object.scale.set(10, 10, 10);
        // create a Tween animation to gradually change the opacity
        const tween = new TWEEN.Tween(object)
          .to({ opacity: 1 }, 1000000) // change opacity to 1 over 1000ms
          .onUpdate(() => {
            object.traverse(function(child) {
              if (child instanceof Mesh) {
                child.material.opacity = object.opacity;
              }
            });
          }).easing(TWEEN.Easing.Quadratic.Out)
          .start(); // start the animation
        this.parachute = object;
        console.log(this.parachute);
      });
    }
  }
drawPlane(){

const loadPlane=new OBJLoader();
const Texture= new TextureLoader();
Texture.load('textures/plane.jpg',(texture)=>{
  loadPlane.load('models/plane.obj',(object)=>{
    object.traverse(function(child) {
      if (child instanceof Mesh) {
        child.material.map = texture;
        child.material.needsUpdate = true;
      }
    });
    object.rotation.x=-Math.PI/2;
    object.position.x=55;
    object.position.y=this.mesh.position.y+100;
    object.position.z=-70;
    object.scale.set(0.5,0.5,0.5);
    scene.add(object); 
   this.plane = object;
    });
});
}
drawPerson(){
  const load=new OBJLoader();
  const Texture=new TextureLoader();
  Texture.load('textures/katarina.png', (texture)=>{
    load.load('models/katarina.obj',(object)=>{
      object.traverse(function(child) {
        if (child instanceof Mesh) {
          child.material.map = texture;
          child.material.needsUpdate = true;
        }
      });
    //   const  geometry=object.children[0].geometry;
    //    this.mesh=new Mesh(
    //     geometry,
    //      new MeshStandardMaterial({map:texture},)
    //  );
    //  this.mesh.material.needsUpdate=true;
    object.position.copy(this.position);
    object.scale.set(1,1,1);
     scene.add(object); 
     this.mesh=object;
     this.drawParachute();
    }); 
  });
}

drawText(){
  const fontLoader= new FontLoader();
  fontLoader.load('fonts/SF Compact_Black.json', function(font) {
    const geometry = new TextGeometry('YOU DIED', {
    font: font,
    size: 100,
    height: 5,
    });
    const material = new MeshStandardMaterial({color: 'red'});
    const textMesh = new Mesh(geometry, material);
    textMesh.position.set(-300,0, 0);
  
    scene.add(textMesh);
    });
}
}

export default parachute;