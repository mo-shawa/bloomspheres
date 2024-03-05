import './style.css'

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const canvas = document.querySelector<HTMLCanvasElement>('canvas.webgl')
if (!canvas) throw new Error('Canvas not found')

const scene = new THREE.Scene()

const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
}

window.addEventListener('resize', () => {
	sizes.width = window.innerWidth
	sizes.height = window.innerHeight

	camera.aspect = sizes.width / sizes.height
	camera.updateProjectionMatrix()

	renderer.setSize(sizes.width, sizes.height)
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const camera = new THREE.PerspectiveCamera(
	75,
	sizes.width / sizes.height,
	0.1,
	1000
)
camera.position.z = 5

const renderer = new THREE.WebGLRenderer({
	canvas,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setClearColor(new THREE.Color('#262837'))

const controls = new OrbitControls(camera, canvas)

const testMesh = new THREE.Mesh(
	new THREE.BoxGeometry(1, 1, 1),
	new THREE.MeshBasicMaterial({ color: '#ff0000' })
)

scene.add(testMesh)

function tick() {
	controls.update()

	renderer.render(scene, camera)

	requestAnimationFrame(tick)
}

tick()
