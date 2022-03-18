import { _ } from 'core-js';
import * as THREE from 'three';

// 동적으로 캔버스 조립하기
// 렌더러가 생성된다.
// const renderer = new THREE.WebGLRenderer();
// renderer.setSize(window.innerWidth, window.innerHeight);
// console.log(renderer.domElement);
// document.body.appendChild(renderer.domElement);
// 랜더러가 가지고 있는 캔버스이다.

const canvas = document.querySelector('#three-canvas');
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

// 씬
const scene = new THREE.Scene();

// 카메라 fov, 종횡비, near, far
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.x = 1;
camera.position.y = 2;
camera.position.z = 5; //5는 크기 단위인데 개발자가 설정하는 단위로 생각하고 작업해야한다. M거나 mm거나 cm이거나
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
