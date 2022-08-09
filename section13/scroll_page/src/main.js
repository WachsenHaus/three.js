import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { House } from './House';
import gsap from 'gsap';

// ----- 주제: 스크롤에 따라 움직이는 3D 페이지

// Renderer
const canvas = document.querySelector('#three-canvas');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Scene
const scene = new THREE.Scene();
// scene.background = new THREE.Color('white');

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// camera.position.y = 1.5;
// camera.position.z = 4;
camera.position.set(-5, 2, 25);
scene.add(camera);

const gltfLoader = new GLTFLoader();
const houses = [];
houses.push(
  new House({
    gltfLoader,
    scene,
    modelSrc: '/models/house.glb',
    x: 0,
    z: 0,
    height: 1,
  })
);
houses.push(
  new House({
    gltfLoader,
    scene,
    modelSrc: '/models/house.glb',
    x: -5,
    z: 20,
    height: 1,
  })
);
houses.push(
  new House({
    gltfLoader,
    scene,
    modelSrc: '/models/house.glb',
    x: 7,
    z: 10,
    height: 1,
  })
);
houses.push(
  new House({
    gltfLoader,
    scene,
    modelSrc: '/models/house.glb',
    x: -10,
    z: 0,
    height: 1,
  })
);
houses.push(
  new House({
    gltfLoader,
    scene,
    modelSrc: '/models/house.glb',
    x: 10,
    z: -10,
    height: 1,
  })
);

// Light
const spotLight = new THREE.SpotLight('white', 0.7);
spotLight.position.set(0, 150, 10);
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024; //그림자의 퀄리티를 수정
spotLight.shadow.mapSize.height = 1024; //그림자의 퀄리티를 수정
spotLight.shadow.camera.near = 1;
spotLight.shadow.camera.far = 200;
scene.add(spotLight);

const directionalLight = new THREE.DirectionalLight('white', 1);
directionalLight.position.x = 1;
directionalLight.position.z = 2;
scene.add(directionalLight);

// Mesh
const floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshStandardMaterial({ color: 'white' }));
floorMesh.rotation.x = -Math.PI / 2;
floorMesh.receiveShadow = true;
scene.add(floorMesh);

// const geometry = new THREE.BoxGeometry(1, 1, 1);
// const material = new THREE.MeshStandardMaterial({
//   color: 'seagreen',
// });
// const mesh = new THREE.Mesh(geometry, material);
// scene.add(mesh);

// 그리기
const clock = new THREE.Clock();

function draw() {
  const delta = clock.getDelta();

  renderer.render(scene, camera);
  renderer.setAnimationLoop(draw);
}

let currentSection = 0;

function setSection() {
  const newSection = Math.round(window.scrollY / window.innerHeight);

  if (currentSection !== newSection) {
    currentSection = newSection;
    console.log('sc');
    gsap.to(camera.position, {
      duration: 1,
      x: houses[currentSection].x,
      z: houses[currentSection].z + 5,
    });
  }
}
function setSize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
}

// 이벤트
window.addEventListener('resize', setSize);
window.addEventListener('scroll', setSection);

draw();
