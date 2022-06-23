import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as cannon from 'cannon-es';
import { PreventDragClick } from './PreventDragClick';
import { MySphere } from './MySphere';
// import boing from './sounds/boing.mp3';
// ----- 주제: 충돌 이벤트, 사운드 넣기

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
  // 같이 트루로
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);

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
  const defaultContactMaterial = new cannon.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
      //기본 물체끼리 부딪히면 마찰력 0.5
      friction: 0.5,
      // 반발력
      restitution: 0.3,
    }
  );
  cannonWorld.defaultContactMaterial = defaultContactMaterial;

  const rubberDefaultContactMaterial = new cannon.ContactMaterial(
    rubberMaterial,
    defaultMaterial,
    {
      friction: 0.5,
      restitution: 0.7,
    }
  );
  cannonWorld.addContactMaterial(rubberDefaultContactMaterial);

  const ironDefaultContactMaterial = new cannon.ContactMaterial(
    ironMaterial,
    defaultMaterial,
    {
      friction: 0.5,
      restitution: 0,
    }
  );
  cannonWorld.addContactMaterial(ironDefaultContactMaterial);

  const floorShape = new cannon.Plane();
  const floorBody = new cannon.Body({
    mass: 0, // 중력의 영향을 받지 않게 mass를 0으로 셋팅함.
    position: new cannon.Vec3(0, 0, 0),
    shape: floorShape,
    material: defaultMaterial,
  });
  floorBody.quaternion.setFromAxisAngle(new cannon.Vec3(-1, 0, 0), Math.PI / 2);
  cannonWorld.addBody(floorBody);

  // threejs box랑 조금 다르다, cannon js는 중심을 기준으로 얼만큼 가는지 알려준다.
  const sphereShape = new cannon.Sphere(0.5);
  const sphereBody = new cannon.Body({
    mass: 1,
    position: new cannon.Vec3(0, 10, 0),
    shape: sphereShape,
    material: defaultMaterial,
  });
  cannonWorld.addBody(sphereBody);

  const floorMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
      color: 'slategray',
    })
  );
  floorMesh.receiveShadow = true;
  floorMesh.rotation.x = -(Math.PI / 2);
  scene.add(floorMesh);

  // Mesh
  const spheres = [];
  const sphereGeometry = new THREE.SphereGeometry(0.5);
  const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 'seagreen',
  });

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

    spheres.forEach((item) => {
      item.mesh.position.copy(item.cannonBody.position);
      item.mesh.quaternion.copy(item.cannonBody.quaternion);
    });
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

  const sound = new Audio('/sounds/boing.mp3');
  function collide(e) {
    // 충돌이 될떄마다 0으로 맞추면 처음부터 다시 재생이된다.
    sound.currentTime = 0;
    // 충돌할 때 일정속도 이상일때만 나오게하는 방법은 ?
    const velocity = e.contact.getImpactVelocityAlongNormal();
    if (velocity > 10) {
      console.log(velocity);
      sound.play();
    }
    console.log(e);
  }
  // 클릭이벤트
  canvas.addEventListener('click', () => {
    // 방향과 힘을 적용하고 어디에 적용할건지 정해주자. 두번째 인자가 어디에 적용인지 정하는것.

    const mySphere = new MySphere({
      scene,
      cannonWorld,
      geometry: sphereGeometry,
      material: sphereMaterial,
      x: (Math.random() - 0.5) * 2,
      y: Math.random() * 5 + 2,
      z: (Math.random() - 0.5) * 2,
      scale: Math.random() + 0.2,
    });

    spheres.push(mySphere);

    // 충돌이 생길때마다 콜라이드 이벤트가 발생된다. cannonbody는 물리엔진이 들어간 바디
    mySphere.cannonBody.addEventListener('collide', collide);
  });

  const preventDragClick = new PreventDragClick(canvas);

  draw();
}
