import * as THREE from 'three';
import { Raycaster, Vector2 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PreventDragClick } from './PreventDragClick';
// ----- 주제:

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
  camera.position.x = 2;
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
  // Mesh
  // const lineMaterial = new THREE.LineBasicMaterial({ color: 'yellow' });
  // const points = [];
  // points.push(new THREE.Vector3(0, 0, 100));
  // points.push(new THREE.Vector3(0, 0, -100));
  // // points를 기반으로 버퍼 지오메트리가 생성된다.
  // const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  // const guide = new THREE.Line(lineGeometry, lineMaterial);
  // scene.add(guide);

  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  const boxMaterial = new THREE.MeshStandardMaterial({ color: 'plum' });
  const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
  boxMesh.name = 'box';

  const torusGeometry = new THREE.TorusGeometry(2, 0.5, 16, 100);
  const torusMaterial = new THREE.MeshStandardMaterial({ color: 'lime' });
  const torusMesh = new THREE.Mesh(torusGeometry, torusMaterial);
  torusMesh.name = 'torus';

  scene.add(boxMesh, torusMesh);

  // 배열에 넣은 이유는 광선에 맞았는지 체크를 하기 위함이다.
  const meshes = [boxMesh, torusMesh];
  // 마우스 좌표
  const mouse = new Vector2();

  const rayCaster = new THREE.Raycaster();

  // 그리기
  const clock = new THREE.Clock();

  function draw() {
    // const delta = clock.getDelta();
    // 사인에서 각도를 늘려주자.
    const time = clock.getElapsedTime();

    boxMesh.position.y = Math.sin(time) * 2;
    torusMesh.position.y = Math.cos(time) * 2;
    boxMesh.material.color.set('plum');
    torusMesh.material.color.set('lime');

    renderer.render(scene, camera);
    renderer.setAnimationLoop(draw);
  }

  function checkIntersects() {
    // 광선이 나오는곳을 조정하는것임.
    // mouse는 내가 생성한 벡터2d임,
    if (preventDragClick.mouseMoved) {
      return;
    }
    rayCaster.setFromCamera(mouse, camera);
    const intersects = rayCaster.intersectObjects(meshes);
    for (const item of intersects) {
      console.log(item.object.name);
      break;
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
  canvas.addEventListener('click', (e) => {
    // three js에 맞게 변경시켜줘야한다.
    // 70%정도의 위치에서 마우스를 클릭했다면. 0.7이고 1.4에 -1을 하면 0.4인데 중간값으로 맞추는것이다.
    mouse.x = (e.clientX / canvas.clientWidth) * 2 - 1;
    mouse.y = -((e.clientY / canvas.clientHeight) * 2 - 1);
    checkIntersects();
  });

  const preventDragClick = new PreventDragClick(canvas);
  draw();
}
