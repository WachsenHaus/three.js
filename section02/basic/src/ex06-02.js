import { _ } from 'core-js';
import * as THREE from 'three';

// -- 주제 : 애니메이션 성능 보정 2
// 애니메이션프레임에서 three.delte를 사용하는것이 가장 좋아보이는 솔루션이다.
// 자바스크립트의 타임을 사용해서 시간값을 보정할 수 있다.(threejs에 의존하지 않는다.)

export const example = () => {
  console.log('렌더링01');
  const canvas = document.querySelector('#three-canvas');
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    // alpha: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
  // renderer.setClearAlpha(0.5);
  //   renderer.setClearColor(0x00ff00);
  //   renderer.setClearAlpha(0.5);

  // 씬에 직접 칠하는 방법
  // 렌더러가 아래 색이 깔려있고, 위에 씬이 색을 칠한다.
  // 단순하게 색을칠할때는 씬에 백그라운드 설정을 한다.
  const scene = new THREE.Scene();
  //   scene.background = new THREE.Color('blue');

  // 카메라 fov, 종횡비, near, far
  // const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const camera = new THREE.OrthographicCamera(
    -(window.innerWidth / window.innerHeight), //left
    window.innerWidth / window.innerHeight, //right
    1, //top
    -1, //bottom,
    0.1,
    1000
  );
  camera.position.x = 2;
  camera.position.y = 2;
  camera.position.z = 5; //5는 크기 단위인데 개발자가 설정하는 단위로 생각하고 작업해야한다. M거나 mm거나 cm이거나
  camera.lookAt(0, 0, 0);
  camera.zoom = 0.5;
  // 카메라가 바뀌면 이걸해야한다구?
  camera.updateProjectionMatrix();
  scene.add(camera);

  // Mesh, 지오메트리와 매태리얼로 존재한다. 매쉬는 3D객체
  const geometry = new THREE.BoxGeometry(1, 1, 1); // 1미터의 정육면체
  //m eshbasicmaterial은 빛이 없어도 색이 표현된다.
  // MeshStandardMaterial 빛이 필요
  const material = new THREE.MeshStandardMaterial({
    // color: 0xff0000
    color: 'red',
  });
  const mesh = new THREE.Mesh(geometry, material);
  // 씬에 랜더러 추가
  scene.add(mesh);

  // 그리기
  let direction = 'up';
  // 경과된 시간값을 가지고있다.
  // const clock = new THREE.Clock();
  // console.log(Date.now());

  let oldTime = Date.now();

  const draw = () => {
    const newTime = Date.now();
    const deltaTime = newTime - oldTime;
    oldTime = newTime;
    // rotation의 각도는 Radian을 사용한다.
    // 360도는 2파이

    // mesh.rotation.y += 0.1;

    // 실행시점으로부터 총 경과시점
    // const time = clock.getElapsedTime();
    // 시간간격을 구해낸다.
    // const delta = clock.getDelta();
    // console.log(delta);
    // const y = THREE.MathUtils.degToRad(delta);
    const limit = 1.2;

    // mesh.rotation.y = time; // 시간을 계속 넣음
    mesh.rotation.y += deltaTime * 0.001; // requestanimationframe이 실행되는 간격을 구해서 회전을 시켜준다. (60프레임이니 0.016간격임)
    if (mesh.position.y > limit) {
      direction = 'down';
    } else if (mesh.position.y < 0) {
      direction = 'up';
    }
    direction === 'down'
      ? (mesh.position.y -= 0.01)
      : (mesh.position.y += 0.01);
    // if(direction)

    // console.log(mesh.position.y);
    renderer.render(scene, camera);
    //
    // window.requestAnimationFrame(draw);
    // vr, ar을 사용할때는 setAnimationLoop을 사용하라.(WebXR 콘텐츠 사용시 꼭 사용해야함.)
    renderer.setAnimationLoop(draw);
  };
  // 태양빛과 비슷하다.
  const light = new THREE.DirectionalLight(0xffffff, 2);
  light.position.x = 2;
  light.position.z = 5;
  scene.add(light);

  //그리기
  //   renderer.render(scene, camera);
  draw();

  const setSize = () => {
    // 카메라
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix(); // 카메라가 변동되면 적용해야한다
    renderer.setSize(window.innerWidth, window.innerHeight);
    console.log(window.devicePixelRatio); //장치의 픽셀 비율을 가져온다.

    renderer.render(scene, camera);
  };
  // 이벤트
  window.addEventListener('resize', setSize);
};

export default example;
