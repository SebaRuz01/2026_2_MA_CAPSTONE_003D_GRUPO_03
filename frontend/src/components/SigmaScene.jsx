import { useEffect, useRef } from 'react'
import * as THREE from 'three'

function createGear(radius, teeth, material) {
  const shape = new THREE.Shape()
  const points = teeth * 2
  for (let index = 0; index <= points; index += 1) {
    const angle = (index / points) * Math.PI * 2
    const toothRadius = index % 2 === 0 ? radius * 1.18 : radius
    const x = Math.cos(angle) * toothRadius
    const y = Math.sin(angle) * toothRadius
    if (index === 0) shape.moveTo(x, y)
    else shape.lineTo(x, y)
  }
  const hole = new THREE.Path()
  hole.absarc(0, 0, radius * 0.38, 0, Math.PI * 2, true)
  shape.holes.push(hole)
  return new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.16, bevelEnabled: false, curveSegments: 8 }), material)
}

function createCar(material) {
  const car = new THREE.Group()
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.55, 1.05), material)
  body.position.y = 0.12
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.55, 0.92), material)
  cabin.position.set(0.15, 0.62, 0)
  cabin.rotation.z = -0.04
  car.add(body, cabin)

  const wheelGeometry = new THREE.TorusGeometry(0.29, 0.065, 8, 20)
  ;[-0.78, 0.8].forEach((x) => {
    ;[-0.56, 0.56].forEach((z) => {
      const wheel = new THREE.Mesh(wheelGeometry, material)
      wheel.position.set(x, -0.2, z)
      wheel.rotation.y = Math.PI / 2
      car.add(wheel)
    })
  })
  return car
}

function SigmaScene() {
  const hostRef = useRef(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    let frameId
    let scrollTarget = window.scrollY
    let scrollCurrent = scrollTarget
    const mobile = window.innerWidth < 900
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 100)
    camera.position.set(0, 0, 11)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !mobile, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.15 : 1.7))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x101513, 0)
    host.appendChild(renderer.domElement)

    const group = new THREE.Group()
    scene.add(group)
    const nodeCount = mobile ? 38 : 78
    const positions = new Float32Array(nodeCount * 3)
    const nodes = []

    for (let index = 0; index < nodeCount; index += 1) {
      const point = new THREE.Vector3(
        THREE.MathUtils.randFloatSpread(18),
        THREE.MathUtils.randFloatSpread(12),
        THREE.MathUtils.randFloatSpread(8) - 2,
      )
      nodes.push(point)
      positions.set([point.x, point.y, point.z], index * 3)
    }

    const nodeGeometry = new THREE.BufferGeometry()
    nodeGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const particles = new THREE.Points(nodeGeometry, new THREE.PointsMaterial({ color: 0x6e9d91, size: mobile ? 0.055 : 0.075, transparent: true, opacity: 0.38 }))
    group.add(particles)

    const linePositions = []
    nodes.forEach((point, index) => {
      for (let other = index + 1; other < nodes.length; other += 1) {
        if (point.distanceTo(nodes[other]) < 2.35) linePositions.push(point.x, point.y, point.z, nodes[other].x, nodes[other].y, nodes[other].z)
      }
    })
    const lineGeometry = new THREE.BufferGeometry()
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3))
    group.add(new THREE.LineSegments(lineGeometry, new THREE.LineBasicMaterial({ color: 0x6c716d, transparent: true, opacity: 0.16 })))

    const mechanical = new THREE.Group()
    const tealWire = new THREE.MeshBasicMaterial({ color: 0x6e9d91, wireframe: true, transparent: true, opacity: mobile ? 0.08 : 0.15 })
    const copperWire = new THREE.MeshBasicMaterial({ color: 0xb17a52, wireframe: true, transparent: true, opacity: mobile ? 0.07 : 0.13 })

    const largeGear = createGear(1.05, 14, copperWire)
    largeGear.position.set(-4.6, 2.5, -2.3)
    largeGear.rotation.set(0.7, 0.25, 0)
    mechanical.add(largeGear)

    const smallGear = createGear(0.62, 11, tealWire)
    smallGear.position.set(-2.85, 3.25, -2.8)
    smallGear.rotation.set(0.7, 0.25, 0.1)
    mechanical.add(smallGear)

    const heroCar = createCar(tealWire)
    heroCar.position.set(4.25, -2.15, -2.15)
    heroCar.rotation.set(0.14, -0.62, -0.05)
    mechanical.add(heroCar)

    if (!mobile) {
      const distantCar = createCar(copperWire)
      distantCar.scale.setScalar(0.62)
      distantCar.position.set(-4.6, -3.6, -3.8)
      distantCar.rotation.set(-0.05, 0.45, 0.03)
      mechanical.add(distantCar)

      const brakeDisc = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.22, 10, 40), copperWire)
      brakeDisc.position.set(4.4, 3.35, -3.4)
      brakeDisc.rotation.set(0.8, 0.35, 0)
      mechanical.add(brakeDisc)
    }
    group.add(mechanical)

    const onScroll = () => { scrollTarget = window.scrollY }
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 900 ? 1.15 : 1.7))
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    const clock = new THREE.Clock()
    const animate = () => {
      const elapsed = clock.getElapsedTime()
      scrollCurrent += (scrollTarget - scrollCurrent) * 0.035
      group.rotation.y = elapsed * 0.018 + scrollCurrent * 0.00012
      group.rotation.x = Math.sin(elapsed * 0.12) * 0.04
      largeGear.rotation.z = elapsed * 0.14
      smallGear.rotation.z = -elapsed * 0.21
      heroCar.position.y = -2.15 + Math.sin(elapsed * 0.45) * 0.1
      mechanical.children.slice(2).forEach((object, index) => {
        object.rotation.y += 0.00045 + index * 0.00008
      })
      camera.position.y = -scrollCurrent * 0.00045
      renderer.render(scene, camera)
      frameId = window.requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      nodeGeometry.dispose()
      lineGeometry.dispose()
      mechanical.traverse((object) => {
        if (object.geometry) object.geometry.dispose()
      })
      tealWire.dispose()
      copperWire.dispose()
      renderer.dispose()
      host.replaceChildren()
    }
  }, [])

  return <div className="sigma-scene" ref={hostRef} aria-hidden="true" />
}

export default SigmaScene
