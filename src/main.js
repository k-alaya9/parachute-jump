import {
    Clock,
    AmbientLight,
    BoxGeometry,
    DirectionalLight,
    Mesh,
    MeshStandardMaterial,
    PerspectiveCamera,
    SphereGeometry,
    Scene,
    Vector3,
    WebGLRenderer,
    PlaneGeometry,
    TextureLoader,
    MeshBasicMaterial,
    BackSide,
    Euler,
    AudioLoader,
    LoadingManager
} from "three"; 
import parachute from './parachute.js';
import * as dat from 'dat.gui'
import World from "./world.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { add } from "@tweenjs/tween.js";

/* DOM access */
const  canvas = document.getElementById("scene");

/* Global Constants */
const scene = new Scene();
const camera = new PerspectiveCamera(
    75,
    canvas.width / canvas.height,
    0.1,
    100000,
);

const renderer = new WebGLRenderer({
    canvas,
    antialias: true 
});

// const controls = new OrbitControls(camera, canvas);

/* Lighting */
const ambientLight = new AmbientLight(0xffffff, 0.7);
const directionalLight = new DirectionalLight(0xffffff, 0.4);
directionalLight.position.set(100, 100, 10);
scene.add(ambientLight, directionalLight);


/* Objects */

// varabiles to get the data from the user and assigned them to the parachute
const toggleSwitch = document.getElementById('toggle-switch');
var audio = new Audio('sounds/wind.ogg');
let switchValue;
var mass;
var initialVelocity;
var slopeAngle;
let height;
var A;
var playSound=true;
var Parachute;
const parachuteForm = document.getElementById("parachute-form");
const radioButtons = document.querySelectorAll('input[name="test"]');
let selectedValue;
var count =0;
const world = new World();
const gui = new dat.GUI();
var a;
var v;
var w;
var fr;
var wind;
var cd;
var h;
var firstPersonShotter=false;
var startflag=false;
var startButton={
  StartButton: ()=>{
    startflag=!startflag;
  }
}
gui.add(startButton,'StartButton');




/* Functions */
//to get the value from the switch to decided if the parachute will open or not
toggleSwitch.addEventListener('change', function() {
  switchValue = this.checked;
  console.log('Switch value:', switchValue);
});
//create parachute
parachuteForm.addEventListener("submit", (event) => {
  event.preventDefault(); // prevent the form from submitting and reloading the page
  // first vaildate the data
  if(validateForm()){
    //increase the count
  ++count;
    //assinged the data
    radioButtons.forEach(radioButton => {
      if (radioButton.checked) {
        selectedValue = radioButton.value;
      }
    });
    console.log(selectedValue);
    
   mass =Number(document.getElementById('parachute-mass').value);
   initialVelocity = Number(document.getElementById("plane-velocity").value);
   height= Number(document.getElementById("height").value);
   A =Number(document.getElementById("person-height").value);
   var angle=Number(document.getElementById('jump-angle').value);
   //switch to make the angel famous angle 
   switch (angle) {
    case 30:
      slopeAngle=Math.PI/6;
      break;
      case 45:
        slopeAngle=Math.PI/4;
        break;
        case 60:
          slopeAngle=Math.PI/3;
          break;
          case 90:
            slopeAngle=Math.PI/2;
            break;
            case 0:
              slopeAngle=Math.PI;
              break;
    default:
      break;
   }
   world.drawSkyBox();
   for(var i=1;i<=50;i++){
    world.drawClouds(world.getRandomValue(-10000,10000),height-(i*100));
   }
   // create the parachute object
   Parachute =new parachute(new Vector3(0,height,0),mass,world,new Vector3(initialVelocity,0,0),slopeAngle,A,switchValue,selectedValue);
   if(Parachute.mesh)
   camera.lookAt(Parachute.mesh.position);
   gui.add(Parachute,'mass',80,100,10);
  cd=gui.add(Parachute,'cd',0.1,1,0.1);
 v= gui.add(Parachute,'v',);
 a=gui.add(Parachute,'a',);
 fr=gui.add(Parachute,'fr');
 w=gui.add(Parachute,'w');
 wind=gui.add(Parachute,'wind',-100,100,10);
 h=gui.add(Parachute,'h',);
   Parachute.drawPlane();
   // print the values
  console.log(mass);
  console.log(initialVelocity);
  console.log(slopeAngle);
  console.log(height);
  console.log(A);
  console.log(switchValue);
  // to scroll the screen to the canvas
  scrollToWidget();

  // to run the simulation
  main();
}
});

// scroll function
function scrollToWidget() {
  const widget = document.getElementById('scene');
  const widgetTop = widget.getBoundingClientRect().top + window.pageYOffset;
  const scrollOptions = {
    top: widgetTop,
    behavior: 'smooth'
  };
  document.documentElement.scrollTo(scrollOptions);
}
// validate function 
function validateForm() {
  const input = document.getElementById('parachute-mass');
  const value = parseInt(input.value);
  const input2 = document.getElementById('height');
  const value2 = parseInt(input2.value);
  const input3 = document.getElementById('person-height');
  const value3 = parseInt(input3.value);
  const input4 = document.getElementById('plane-velocity');
  const value4 = parseInt(input4.value);
  const input5 = document.getElementById('jump-angle');
  const value5 = parseInt(input5.value);
  if (isNaN(value) || value <= 60 || value >= 200) {
    alert('Please enter a mass between 59 and 200.');
    input.focus();
    return false;
  }
   else if (isNaN(value2) ||value2 >=110000){  
        alert('Please enter a height less than 110000');
    input2.focus();
    return false;
    }

   else if (isNaN(value3) || value3 <1 || value3 >2){
      alert('Please enter a vaild person height');
    input3.focus();
    return false;
    }

   else if (isNaN(value4) || value4 <= 5 || value4 > 200){
     alert('Please enter a vaild velocity');
    input4.focus();
    return false;
    }

   else if (isNaN(value5) || (value5  !== 0 && value5 !== 30 && value5 !== 45 && value5 !== 60 && value5 !== 90)){
    alert('Please enter a famous angle');
    input5.focus();
    return false;
    }
  return true;
}
    
const handleWindowResize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    renderer.setSize(canvas.width, canvas.height);
    renderer.setPixelRatio(window.devicePixelRatio);

    camera.aspect = canvas.width / canvas.height;
    camera.updateProjectionMatrix();

    // controls.update();
};

const init = () => {
    // controls.enableDamping = true;
    // controls.dampingFactor = 0.05;
    // controls.maxPolarAngle = Math.PI;

    // controls.update();

    window.addEventListener("resize", handleWindowResize);
    window.addEventListener("load", handleWindowResize);
};
const update = (delta) => {
  // Update the parachute's position and velocity based on the net force acting on it
  Parachute.update(delta);
  // Apply wind force to the parachute
  Parachute.windforce( );
  // // Apply drag  force to the parachtue
  // Parachute.drag();
  // // Apply weight force to the parachute
  // Parachute.weghit();
  if(a&&v&&cd){
  a.updateDisplay();
  v.updateDisplay();
  w.updateDisplay();
  fr.updateDisplay();
  wind.updateDisplay( );
  cd.updateDisplay();
  h.updateDisplay();
  }
    // Update the camera position and lookAt direction to follow the parachute's movement
    if(Parachute.mesh&&Parachute.plane&&firstPersonShotter){
      const parachutePosition = Parachute.mesh.position;
      const cameraPosition = new Vector3(parachutePosition.x, parachutePosition.y+60 ,parachutePosition.z+7);
      // camera.rotation.x=-Math.PI/4;
      camera.position.copy(cameraPosition);
    }
    else if(Parachute.mesh&&Parachute.plane&&!firstPersonShotter){
      const parachutePosition = Parachute.mesh.position;
      const cameraPosition = new Vector3(parachutePosition.x, parachutePosition.y+200 ,parachutePosition.z-80);
      camera.position.copy(cameraPosition);
      camera.lookAt(parachutePosition);
    }


};


//camera.rotation.y=-Math.PI;
const euler = new Euler(0, 0, 0, 'YXZ');
const rotationSpeed = Math.PI / 180;
document.addEventListener('mousemove', (e) => {
// const movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
// const movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;

// const mx = movementX * Math.PI / 180;
// const my = -movementY * Math.PI / 180;
// camera.rotation.x += my;
// camera.rotation.y -= mx;

// camera.rotation.x = Math.min(Math.max(camera.rotation.x, -1.0472), 1.0472);
const movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
const movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;

euler.y -= movementX * rotationSpeed;
euler.x -= movementY * rotationSpeed;
euler.x = Math.min(Math.max(euler.x, -1.0472), 1.0472);

camera.quaternion.setFromEuler(euler);
});

 // Listen for the keydown event on the document
 window.addEventListener('keydown', (event) => {
  // Get the keyCode of the pressed key
  const keyCode = event.code;
  // Update the position of the camera or other objects based on the pressed key
  switch (keyCode) {
    case 'KeyP':
      playSound=!playSound;
      break;
    case 'KeyX':
     camera.position.y -=10;
      break;
    case 'KeyZ':
      camera.position.y +=10;
      break;
    case 'KeyD':
      Parachute.mesh.position.x -=10;
      break;
    case 'KeyA':
      Parachute.mesh.position.x +=10;
      break;
    case 'KeyS':
     firstPersonShotter? camera.rotation.x +=Math.PI*0.02:Parachute.mesh.rotation.x +=Math.PI*0.02; camera.rotation.x +=Math.PI*0.02;
      break;
    case 'KeyW':
     firstPersonShotter? camera.rotation.x -=Math.PI*0.02:Parachute.mesh.rotation.x -=Math.PI*0.02;
        break;
    case 'KeyE':
     firstPersonShotter? camera.rotation.y  -=Math.PI*0.02:Parachute.mesh.rotation.y -=Math.PI*0.02; 
          break;
    case 'KeyQ':
     firstPersonShotter? camera.rotation.y +=Math.PI*0.02:Parachute.mesh.rotation.y +=Math.PI*0.02;
           break;
           case 'KeyC':
            firstPersonShotter =!firstPersonShotter;
            camera.rotation.x=-Math.PI;
            break;
            case'KeyF':
            openFullscreen();
            break;
    default:
      // Do nothing for other keys
      break;
  }
});
function openFullscreen() {
  var elem = document.getElementById("scene");
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) { /* Firefox */
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE/Edge */
    elem.msRequestFullscreen();
  }
  elem.style.width = '100%';
  elem.style.height = '100%';
}

handleWindowResize();
const render = () => {
    // controls.update();
    renderer.render(scene, camera);
};
const clock = new Clock();

export const main = () => {
    const loop = () => {
        window.requestAnimationFrame(loop);
        const delta = clock.getDelta();
        if(Parachute.mesh&& Parachute.plane&&startflag){
          update(delta);
          if(playSound===true)
          audio.play();
        else{
          audio.pause();
        }
                  }
        render();
          };
    handleWindowResize();
    init();
    loop();
};
export default scene;