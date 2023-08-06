import * as THREE from "three"
import { OrbitControls } from "./../../node_modules/three/examples/jsm/controls/OrbitControls.js"


const view3D  = {
    init: (opts = {}) => {
        const dimensions = {
            width: 36,
            height: 36,
            depth: 36
        }

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            powerPreference: "low-power",
            antialias: true
        })
        // if (window.innerWidth > window.innerHeight) {
            
        //     renderer.setSize( window.innerWidth*.8, window.innerHeight*.8 )
        // } else {

        //     renderer.setSize( window.innerWidth*.8, window.innerHeight*.8 )
        // }
        // renderer.shadowMapEnabled = true;
        // renderer.shadowMapType = THREE.PCFSoftShadowMap;

        const scene             = new THREE.Scene()
        const camera            = new THREE.PerspectiveCamera( 35, 1, 0.1, 1000 )
        camera.position.set( 0, 8, 0)
        camera.lookAt( 0, 0, 0)

        const cameraHelper = new THREE.CameraHelper(camera)
        // scene.add(cameraHelper)
        // Lights
        const ambientLight      = new THREE.AmbientLight( "#fffaea", .2)
        const spotLight         = new THREE.SpotLight("#fff", .64, 0 ,Math.PI/360*100 ,0,2)

        spotLight.castShadow = true
        spotLight.shadow.mapSize.width = 1024 // default
        spotLight.shadow.mapSize.height = 1024

        spotLight.position.x = dimensions.width
        spotLight.position.y = dimensions.height
        spotLight.position.z = dimensions.depth/2
        spotLight.lookAt(0,0,0)
        var spotLight2 = spotLight.clone()
        spotLight.position.x -= dimensions.width*2
        spotLight.position.z -= dimensions.depth
        spotLight.lookAt(0,0,0)


        scene.add(ambientLight, spotLight,spotLight2)


        function animate() {
            // if mouse down

            requestAnimationFrame( animate )
            renderer.render(scene, camera)
        }
        animate()
        let orbitControls = undefined
        
        if (opts.orbitControls) {
            orbitControls = new OrbitControls( camera, renderer.domElement )
        }

        const results = {
            scene: scene,
            renderer:renderer,
            camera: camera,
        }
        if (orbitControls) {
            results.orbitControls = orbitControls
        }
        return results
    },
}

export default view3D