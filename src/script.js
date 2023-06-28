import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

THREE.ColorManagement.enabled = false

/**
 * Base
 */


// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Galaxy
 */
const parameters = {}
parameters.count = 100000
parameters.pSize= 0.01
parameters.radius=5
parameters.branches=3
parameters.spin=1
parameters.randomness=0.2
parameters.density=3
parameters.insideColor = '#ff6030'
parameters.outsideColor = '#1b3964'

let geometry = null
let material = null
let points = null


const generateGalaxy = ()=> {

    //check if galaxey already exists and destroy
    if(points !== null){
        geometry.dispose()
        material.dispose()
        scene.remove(points)
    }


    /**
     * Galaxy GEO
     */
    geometry = new THREE.BufferGeometry()

    const positions = new Float32Array(parameters.count*3)
    const colors = new Float32Array(parameters.count*3)


    //base color
    const colorInside = new THREE.Color(parameters.insideColor)
    const colorOutside = new THREE.Color(parameters.outsideColor)


    for(let i=0;i<parameters.count;i++){
        const rad = Math.random()*parameters.radius
        const i3 = i*3
        const branchAngle = (i% parameters.branches)/parameters.branches *Math.PI*2 //this gives number between 0-PI
        const spinAngle = rad * parameters.spin

        const randomX = Math.pow(Math.random(),parameters.density)* (Math.random() <0.5 ? 1 : -1)
        const randomY = Math.pow(Math.random(),parameters.density)* (Math.random() <0.5 ? 1 : -1)
        const randomZ = Math.pow(Math.random(),parameters.density)* (Math.random() <0.5 ? 1 : -1)

        positions[i3 +0]= Math.sin(branchAngle+spinAngle)*rad   +randomX    //x
        positions[i3 +1]=  randomY    //y
        positions[i3 +2]= Math.cos(branchAngle+spinAngle)*rad  +randomZ    //z

        //colors
        const mixedColor = colorInside.clone().lerp(colorOutside,rad/parameters.radius)

        colors[i3 + 0]=mixedColor.r
        colors[i3 + 1]=mixedColor.g
        colors[i3 + 2]=mixedColor.b

    }

    geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions,3)
        )
    geometry.setAttribute(
        'color',
        new THREE.BufferAttribute(colors,3)
        )



    /**
     * Galaxy MAT
     */
    material = new THREE.PointsMaterial({
        size:parameters.pSize,
        sizeAttenuation:true,
        depthWrite:false, //this allows particels to be drawn on top of each other
        blending: THREE.AdditiveBlending,
        vertexColors:true
    })

    points = new THREE.Points(geometry,material)
    scene.add(points)


}
generateGalaxy()

// Debug
const gui = new dat.GUI()

gui.add(parameters, 'count',100,1000000,100).onFinishChange(generateGalaxy)
gui.add(parameters, 'pSize',0.001,0.1,0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'radius',0.01,20,0.01).onFinishChange(generateGalaxy)
gui.add(parameters, 'branches',2,20,1).onFinishChange(generateGalaxy)
gui.add(parameters, 'spin',-5,5,1).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomness',0,2,0.01).onFinishChange(generateGalaxy)
gui.add(parameters, 'density',1,10,0.01).onFinishChange(generateGalaxy)
gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy)
gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy)


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
// const axesHelper = new THREE.AxesHelper()
// scene.add(axesHelper)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.outputColorSpace = THREE.LinearSRGBColorSpace
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()