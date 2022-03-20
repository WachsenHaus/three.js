import { _ } from 'core-js';
import * as THREE from 'three';

// -- 주제 : 브라우저 창 사이즈 변경에 대응하기

export const example = () => {
  console.log('렌더링01');
  const canvas = document.querySelector('#three-canvas');
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);

  // 씬
  const scene = new THREE.Scene();

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
  camera.position.x = 1;
  camera.position.y = 2;
  camera.position.z = 1; //5는 크기 단위인데 개발자가 설정하는 단위로 생각하고 작업해야한다. M거나 mm거나 cm이거나
  camera.lookAt(0, 0, 0);
  camera.zoom = 0.5;
  // 카메라가 바뀌면 이걸해야한다구?
  camera.updateProjectionMatrix();
  scene.add(camera);

  // Mesh, 지오메트리와 매태리얼로 존재한다. 매쉬는 3D객체
  const geometry = new THREE.BoxGeometry(1, 1, 1); // 1미터의 정육면체
  const material = new THREE.MeshBasicMaterial({
    // color: 0xff0000
    color: 'red',
  });
  const mesh = new THREE.Mesh(geometry, material);
  // 씬에 랜더러 추가
  scene.add(mesh);

  //그리기
  renderer.render(scene, camera);

  const setSize = () => {
    // 카메라
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix(); // 카메라가 변동되면 적용해야한다
    renderer.setSize(window.innerWidth, window.innerHeight);
    console.log(window.devicePixelRatio); //장치의 픽셀 비율을 가져온다.
    renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
    renderer.render(scene, camera);
  };
  // 이벤트
  window.addEventListener('resize', setSize);
};

export default example;
