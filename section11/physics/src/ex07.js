import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/gltfloader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as cannon from 'cannon-es';
import { PreventDragClick } from './PreventDragClick';
import { MySphere } from './MySphere';
import { Domino } from '../src/Domino';
// import boing from './sounds/boing.mp3';
// ----- 주제: 도미노만들기

// cannon.js 문서
// http://schteppe.github.io/cannon.js/docs/
// 주의! https 아니고 http

// contectMaterial

export default function example() {
  // Renderer
  const canvas = document.querySelector('#three-canvas');
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
  // 렌더러 기능
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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
  // 같이 트루로
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);

  // Loader
  const gltfLoader = new GLTFLoader();

  // Cannon(물리 엔진)
  const cannonWorld = new cannon.World();
  cannonWorld.gravity.set(0, -10, 0);

  cannonWorld.allowSleep = true; // body가 엄청느려지면 테스트안함.
  cannonWorld.broadphase = new cannon.SAPBroadphase(cannonWorld); // 자동 최적화
  // SAPBroadphase  제일좋음
  // NaiveBroadphase // 기본값
  // GridBroadphas // 구역을 나누어 테스트

  // ContactMaterial
  const defaultMaterial = new cannon.Material('default');
  const rubberMaterial = new cannon.Material('rubber');
  const ironMaterial = new cannon.Material('iron');
  const defaultContactMaterial = new cannon.ContactMaterial(defaultMaterial, defaultMaterial, {
    //기본 물체끼리 부딪히면 마찰력 0.5
    friction: 0.01,
    // 반발력
    restitution: 0.9,
  });
  cannonWorld.defaultContactMaterial = defaultContactMaterial;

  // const rubberDefaultContactMaterial = new cannon.ContactMaterial(rubberMaterial, defaultMaterial, {
  //   friction: 0.5,
  //   restitution: 0.7,
  // });
  // cannonWorld.addContactMaterial(rubberDefaultContactMaterial);

  // const ironDefaultContactMaterial = new cannon.ContactMaterial(ironMaterial, defaultMaterial, {
  //   friction: 0.5,
  //   restitution: 0,
  // });
  // cannonWorld.addContactMaterial(ironDefaultContactMaterial);

  const floorShape = new cannon.Plane();
  const floorBody = new cannon.Body({
    mass: 0, // 중력의 영향을 받지 않게 mass를 0으로 셋팅함.
    position: new cannon.Vec3(0, 0, 0),
    shape: floorShape,
    material: defaultMaterial,
  });
  floorBody.quaternion.setFromAxisAngle(new cannon.Vec3(-1, 0, 0), Math.PI / 2);
  cannonWorld.addBody(floorBody);

  const floorMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshStandardMaterial({
      color: 'slategray',
    })
  );
  floorMesh.receiveShadow = true;
  floorMesh.rotation.x = -(Math.PI / 2);
  scene.add(floorMesh);

  // 도미노 생성
  const dominos = [];
  let domino;

  for (let i = -3; i < 17; i++) {
    domino = new Domino({
      // 씬에 메쉬를 애드하고
      index: i,
      scene,
      // 물리엔진도 얹혀주고
      cannonWorld,
      // 로더를
      gltfLoader,
      z: -i * 0.8,
    });
    dominos.push(domino);
  }

  // 그리기
  const clock = new THREE.Clock();

  function draw() {
    const delta = clock.getDelta();
    let cannonStepTime = 1 / 60;
    // 초당 주사율에 따라서 주사율을 동적으로 집어넣어주자, 165hz 240hz도 고려해서 하면 좋음
    if (delta < 0.05) {
      cannonStepTime = 1 / 240;
    } else if (delta < 0.01) {
      cannonStepTime = 1 / 120;
    }
    cannonWorld.step(cannonStepTime, delta, 3);

    dominos.forEach((item) => {
      if (item.cannonBody) {
        item.modelMesh.position.copy(item.cannonBody.position);
        item.modelMesh.quaternion.copy(item.cannonBody.quaternion);
      }
    });

    renderer.render(scene, camera);
    renderer.setAnimationLoop(draw);
  }

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function checkIntersects() {
    raycaster.setFromCamera(mouse, camera); // 카메라에서 광선을 쏘는것,

    // 씬에 추가된 자식들을 다 체크하는 방법이 있고
    // 객체가 어떤지 알고싶으면 Mesh가 있다. Mesh에 이름을 넣어주자.
    const intersects = raycaster.intersectObjects(scene.children);
    //

    if (intersects[0].object.cannonBody) {
      intersects[0].object.cannonBody.applyForce(new cannon.Vec3(0, 0, -200), new cannon.Vec3(0, 0, 0));
    }
    // 마찰력 반발력을 조절하자.
    intersects.forEach((item) => {
      if (item?.object.name.includes('도미노')) {
        console.log(item.object.name);
      }
    });
  }
  canvas.addEventListener('click', (e) => {
    if (preventDragClick.mouseMoved) return;
    mouse.x = (e.clientX / canvas.clientWidth) * 2 - 1; // clientX / clientWidth는 비율이다.
    mouse.y = -((e.clientY / canvas.clientHeight) * 2 - 1); // three js는 마우스의 y는 방향이 반대이다.

    checkIntersects();
  });

  function setSize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
  }

  // 이벤트
  window.addEventListener('resize', setSize);

  // const sound = new Audio('/sounds/boing.mp3');
  // function collide(e) {
  //   // 충돌이 될떄마다 0으로 맞추면 처음부터 다시 재생이된다.
  //   sound.currentTime = 0;
  //   // 충돌할 때 일정속도 이상일때만 나오게하는 방법은 ?
  //   const velocity = e.contact.getImpactVelocityAlongNormal();
  //   if (velocity > 10) {
  //     console.log(velocity);
  //     sound.play();
  //   }
  //   console.log(e);
  // }

  const preventDragClick = new PreventDragClick(canvas);

  const btn = document.createElement('button');
  btn.style.cssText = 'position: absolute; left: 20px; top:20px; font-size: 20px;';
  btn.innerHTML = '삭제';
  document.body.append(btn);

  btn.addEventListener('click', () => {
    spheres.forEach((item) => {
      scene.remove(item.mesh);
      item.cannonBody.removeEventListener('collide', collide);
      cannonWorld.removeBody(item.cannonBody);
    });
  });

  draw();
}
