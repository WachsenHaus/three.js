import * as THREE from 'three';
import dat from 'dat.gui';

// ----- 주제:그룹

export default function example() {
  // Renderer
  const canvas = document.querySelector('#three-canvas');
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);

  // Scene
  const scene = new THREE.Scene();

  // Camera
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.y = 1.5;
  camera.position.z = 4;
  scene.add(camera);

  // Light
  const ambientLight = new THREE.AmbientLight('white', 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight('white', 1);
  directionalLight.position.x = 1;
  directionalLight.position.z = 2;
  scene.add(directionalLight);

  // Mesh
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({
    color: 'hotpink',
  });
  const sunG1 = new THREE.Group();
  const sun = new THREE.Mesh(geometry, material);
  const earthG2 = new THREE.Group();
  const earth = sun.clone();
  earth.scale.set(0.3, 0.3, 0.3);
  earthG2.position.x = 2;

  const moonG3 = new THREE.Group();
  const moon = earth.clone();
  moon.position.x = 0.5;
  moon.scale.set(0.15, 0.15, 0.15);
  moonG3.add(moon);
  earthG2.add(earth, moonG3);
  sunG1.add(sun, earthG2);
  scene.add(sunG1);

  // scene.add(mesh);

  // AxesHelper
  const axesHelper = new THREE.AxesHelper(3);
  scene.add(axesHelper);

  // Dat GUI
  const gui = new dat.GUI();
  gui.add(camera.position, 'x', -5, 5, 0.1).name('카메라 X');
  gui.add(camera.position, 'y', -5, 5, 0.1).name('카메라 Y');
  gui.add(camera.position, 'z', 2, 10, 0.1).name('카메라 Z');

  // 그리기
  const clock = new THREE.Clock();

  //축을 다시 정해줌.
  //   mesh.rotation.reorder('YXZ');
  //   mesh.rotation.x = THREE.MathUtils.degToRad(5);
  // mesh.rotation.y = THREE.MathUtils.degToRad(20);

  function draw() {
    const delta = clock.getDelta();

    sunG1.rotation.y += delta;
    earthG2.rotation.y += delta;
    moonG3.rotation.y += delta;

    // mesh.rotation.x = THREE.MathUtils.degToRad(0);
    // mesh.rotation.x = Math.PI / 4;
    // mesh.rotation.x = 1;
    // mesh.rotation.z += delta;
    // console.log(mesh.position.distanceTo(camera.position));

    renderer.render(scene, camera);
    renderer.setAnimationLoop(draw);
  }

  function setSize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
  }

  // 이벤트
  window.addEventListener('resize', setSize);

  draw();
}
