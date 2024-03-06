import { Mesh, MeshStandardMaterial, Object3D, Object3DEventMap } from 'three'

export const isMesh = (node: Object3D<Object3DEventMap>): node is Mesh =>
	node instanceof Mesh

export const isStandardMaterial = (
	material: Mesh['material']
): material is MeshStandardMaterial => material instanceof MeshStandardMaterial

export function setNormalEmissive(node: Object3D) {
	if (isMesh(node) && isStandardMaterial(node.material)) {
		node.material.emissiveIntensity = 1
	}
}
