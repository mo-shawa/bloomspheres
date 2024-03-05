import './style.css'

import { gen } from 'culler'
import { GUI } from 'lil-gui'
import Stats from 'stats.js'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'

import { isMesh, isStandardMaterial } from './utils'

const BLOOM_SCENE = 1
const bloomLayer = new THREE.Layers()
bloomLayer.set(BLOOM_SCENE)

const stats = new Stats()
document.body.appendChild(stats.dom)

const params = {
	count: 100,
	size: 0.1,
	spread: 2,
}

const gui = new GUI()

gui
	.add(params, 'count')
	.min(1)
	.max(1000)
	.step(1)
	.name('Count')
	.onFinishChange(initScene)

gui
	.add(params, 'size')
	.min(0.1)
	.max(2)
	.step(0.1)
	.name('Size')
	.onFinishChange(initScene)

gui
	.add(params, 'spread')
	.min(0.1)
	.max(50)
	.step(0.1)
	.name('Spread')
	.onFinishChange(initScene)

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

	// camera.left = -sizes.width / 2
	// camera.right = sizes.width / 2
	// camera.top = sizes.height / 2
	// camera.bottom = -sizes.height / 2

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

camera.position.z = 3

// const camera = new THREE.OrthographicCamera(
// 	-sizes.width / 2,
// 	sizes.width / 2,
// 	sizes.height / 2,
// 	-sizes.height / 2,
// 	0.1,
// 	100
// ) // interesting

// camera.position.z = 0

const renderer = new THREE.WebGLRenderer({
	canvas,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setClearColor(new THREE.Color('#262837'))
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const effectComposer = new EffectComposer(renderer)

// @ts-ignore
const bloomPass = new UnrealBloomPass()

const renderPass = new RenderPass(scene, camera)

effectComposer.addPass(renderPass)

effectComposer.addPass(bloomPass)

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

function initScene() {
	scene.traverse(disposeMaterial)

	scene.clear()

	const geometry = new THREE.IcosahedronGeometry(1, 15)

	for (let i = 0; i < params.count; i++) {
		const material = new THREE.MeshBasicMaterial({
			color: new THREE.Color(gen({ type: 'rgb' })),
		})

		const mesh = new THREE.Mesh(geometry, material)

		mesh.position.x = (Math.random() - 0.5) * params.spread
		mesh.position.y = (Math.random() - 0.5) * params.spread
		mesh.position.z = (Math.random() - 0.5) * params.spread

		mesh.scale.setScalar(Math.random() * params.size)

		scene.add(mesh)
	}
}

initScene()

function tick() {
	stats.begin()
	controls.update()

	// renderer.render(scene, camera)
	effectComposer.render()

	stats.end()

	requestAnimationFrame(tick)
}

tick()

function disposeMaterial(obj: THREE.Object3D) {
	if (isMesh(obj) && isStandardMaterial(obj.material)) {
		obj.material.dispose()
	}
}
