import './style.css'

import { gen } from 'culler'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'

import { isMesh, isStandardMaterial } from './utils'

const params = {
	count: 100,
	size: 0.1,
}

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
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const effectComposer = new EffectComposer(renderer)

const bloomPass = new UnrealBloomPass()

const renderPass = new RenderPass(scene, camera)

effectComposer.addPass(renderPass)

effectComposer.addPass(bloomPass)

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

function initScene() {
	scene.traverse(disposeMaterial)

	const geometry = new THREE.IcosahedronGeometry(1, 15)

	for (let i = 0; i < params.count; i++) {
		const material = new THREE.MeshBasicMaterial({
			color: new THREE.Color(gen()),
			wireframe: true,
		})

		const mesh = new THREE.Mesh(geometry, material)

		mesh.position.x = (Math.random() - 0.5) * 4
		mesh.position.y = (Math.random() - 0.5) * 4
		mesh.position.z = (Math.random() - 0.5) * 4

		mesh.scale.setScalar(Math.random() * params.size)

		scene.add(mesh)
	}
}

initScene()

function tick() {
	controls.update()

	// renderer.render(scene, camera)
	effectComposer.render()

	requestAnimationFrame(tick)
}

tick()

function disposeMaterial(obj: THREE.Object3D) {
	if (isMesh(obj) && isStandardMaterial(obj.material)) {
		obj.material.dispose()
	}
}
