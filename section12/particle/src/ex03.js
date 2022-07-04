import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// ----- 주제: 파티클에 이미지를 사용해보자.

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
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
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

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // Mesh
  // 버퍼지오메트리는 임시로 만들어진것이다.
  const geometry = new THREE.BufferGeometry();
  const count = 1000;
  const positions = new Float32Array(count * 3); // 곱하기 3은 x,y,z 포인트가 3개이기 때문에 3배로 늘림
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < positions.length; i++) {
    positions[i] = (Math.random() - 0.5) * 10;
    colors[i] = Math.random();
  }

  // 포인트 하나당 값을 3개를 쓰겠습니다.
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  console.log(geometry);

  const textureLoader = new THREE.TextureLoader();
  const particleTexture = textureLoader.load('/images/star.png');
  const material = new THREE.PointsMaterial({
    size: 0.1,
    map: particleTexture, // 파티클 텍스쳐는 맵으로
    // color: 'lime',
    transparent: true,
    alphaMap: particleTexture,
    depthWrite: false,
    // 색상
    vertexColors: true,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  //   const geometry = new THREE.BoxGeometry(1, 32, 32);

  //   const material = new THREE.MeshStandardMaterial({
  //     wireframe: true,
  //   });

  // 그리기
  const clock = new THREE.Clock();

  function draw() {
    const delta = clock.getDelta();

    controls.update();

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
