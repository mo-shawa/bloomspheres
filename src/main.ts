import './style.css'

import { gen } from 'culler'
import { GUI } from 'lil-gui'
import Stats from 'stats.js'
import * as THREE from 'three'
import { RenderPass } from 'three/examples/jsm/Addons.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

import * as TWEEN from '@tweenjs/tween.js'

const stats = new Stats()
document.body.appendChild(stats.dom)

const params = {
	count: 1000,
	size: 0.1,
	spread: 10,
}

const gui = new GUI()

gui
	.add(params, 'count')
	.min(1)
	.max(5000)
	.step(1)
	.name('Count')
	.onFinishChange(generateSpheres)

gui
	.add(params, 'size')
	.min(0.1)
	.max(2)
	.step(0.1)
	.name('Size')
	.onFinishChange(generateSpheres)

gui
	.add(params, 'spread')
	.min(0.1)
	.max(50)
	.step(0.1)
	.name('Spread')
	.onFinishChange(generateSpheres)

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

	finalComposer.setSize(sizes.width, sizes.height)
})

const camera = new THREE.PerspectiveCamera(
	75,
	sizes.width / sizes.height,
	0.1,
	1000
)

camera.position.z = 3

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.autoRotate = true
controls.autoRotateSpeed = 0.3

const renderer = new THREE.WebGLRenderer({
	canvas,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setClearColor(new THREE.Color('#010003'))
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
// renderer.outputColorSpace = 'srgb'

const renderPass = new RenderPass(scene, camera)
const bloomPass = new UnrealBloomPass(new THREE.Vector2(), 1, 1, 0)

gui.add(bloomPass, 'strength').min(0).max(2).step(0.01).name('Strength')

const finalComposer = new EffectComposer(renderer)
finalComposer.addPass(renderPass)
finalComposer.addPass(bloomPass)

function generateSpheres() {
	scene.clear()

	const geometry = new THREE.IcosahedronGeometry(1, 15)

	for (let i = 0; i < params.count; i++) {
		const color = gen({
			type: 'rgb',
			minR: 100,
			minB: 100,
			minG: 100,
			maxR: 200,
			maxB: 200,
			maxG: 200,
		})

		const material = new THREE.MeshLambertMaterial({
			emissive: new THREE.Color(color),
			emissiveIntensity: 0.2,
		})

		const mesh = new THREE.Mesh(geometry, material)

		mesh.position.x = (Math.random() - 0.5) * params.spread
		mesh.position.y = (Math.random() - 0.5) * params.spread
		mesh.position.z = (Math.random() - 0.5) * params.spread

		mesh.scale.setScalar(Math.random() * params.size + 0.05)

		scene.add(mesh)
	}
}

generateSpheres()

const raycaster = new THREE.Raycaster()
raycaster.params.Mesh.threshold = 0.1
const cursor = new THREE.Vector2()

window.addEventListener('mousemove', (event) => {
	cursor.x = (event.clientX / sizes.width) * 2 - 1
	cursor.y = -(event.clientY / sizes.height) * 2 + 1
})

function tick() {
	stats.begin()
	controls.update()

	// renderer.render(scene, camera)
	finalComposer.render()

	raycaster.setFromCamera(cursor, camera)
	TWEEN.update()

	const intersects = raycaster.intersectObjects(scene.children)

	if (intersects.length > 0) {
		const object = intersects[0].object as THREE.Mesh
		const material = object.material as THREE.MeshStandardMaterial
		new TWEEN.Tween(material)
			.to({ emissiveIntensity: 8 }, 1000)
			.chain(new TWEEN.Tween(material).to({ emissiveIntensity: 0.2 }, 10000))
			.easing(TWEEN.Easing.Bounce.InOut)
			.start()
	}

	stats.end()

	requestAnimationFrame(tick)
}

tick()
