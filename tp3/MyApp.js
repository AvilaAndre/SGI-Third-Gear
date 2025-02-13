import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { MyContents } from "./MyContents.js";
import Stats from "three/addons/libs/stats.module.js";
import { MyClock } from "./utils/MyClock.js";

/**
 * This class contains the application object
 */
class MyApp {
    /**
     * the constructor
     */
    constructor() {
        this.scene = null;
        this.stats = null;

        // camera related attributes
        this.activeCamera = null;
        this.activeCameraName = null;
        this.lastCameraName = null;
        this.cameras = [];
        this.frustumSize = 20;

        // other attributes
        this.renderer = null;
        this.controls = null;
        this.gui = null;
        this.axis = null;
        this.contents == null;

        // a clock to only update big screens once every X seconds
        this.updateBigScreensClock = null;
        // update every 4000 milliseconds
        this.updateBigScreensTime = 4000;
    }
    /**
     * initializes the application
     */
    init() {
        // Create an empty scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x101010);

        this.stats = new Stats();
        this.stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild(this.stats.dom);

        this.initCameras();
        this.setActiveCamera("Default");

        // Create a renderer with Antialiasing
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor("#000000");
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Configure renderer size
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        // Append Renderer to DOM
        document.getElementById("canvas").appendChild(this.renderer.domElement);

        // manage window resizes
        window.addEventListener("resize", this.onResize.bind(this), false);

        // A clock to get DeltaTime
        this.clock = new THREE.Clock(true);

        this.appMaterial = new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load("scenes/scene1/textures/sprite_sheet.png"),
        });

        // frame buffer
        this.dpr = window.devicePixelRatio;

        this.framebufferTextureSize = new THREE.Vector2(
            window.innerWidth * this.dpr,
            window.innerHeight * this.dpr
        );
        this.framebufferVector = new THREE.Vector2();

        this.framebufferTexture = new THREE.FramebufferTexture(
            this.framebufferTextureSize.x,
            this.framebufferTextureSize.y
        );

        // target for depth buffer

        this.target = new THREE.RenderTarget(
            this.framebufferTextureSize.x,
            this.framebufferTextureSize.y
        );

        this.target.texture.minFilter = THREE.NearestFilter;
        this.target.texture.magFilter = THREE.NearestFilter;

        this.target.depthTexture = new THREE.DepthTexture();
        this.target.depthTexture.format = THREE.DepthFormat;
        this.target.depthTexture.type = THREE.UnsignedByteType;

        this.updateBigScreensClock = new MyClock();
    }

    /**
     * initializes all the cameras
     */
    initCameras() {
        const aspect = window.innerWidth / window.innerHeight;

        // Create a basic perspective camera
        const perspective1 = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        perspective1.position.set(10, 10, 3);
        perspective1.targetCoords = new THREE.Vector3(0, 0, 0);
        this.cameras["Default"] = perspective1;
    }

    /**
     * Resets the cameras data stored
     */
    resetCameras() {
        this.cameras = [];
        this.initCameras();
        this.setActiveCamera("Default");
    }

    /**
     * sets the active camera by name
     * @param {String} cameraName
     */
    setActiveCamera(cameraName) {
        this.activeCameraName = cameraName;
        this.activeCamera = this.cameras[this.activeCameraName];
    }

    getActiveCamera() {
        return this.cameras[this.activeCameraName];
    }

    /**
     * updates the active camera if required
     * this function is called in the render loop
     * when the active camera name changes
     * it updates the active camera and the controls
     */
    updateCameraIfRequired() {
        // camera changed?

        if (
            this.lastCameraName !== this.activeCameraName ||
            this.updateCameras
        ) {
            this.updateCameras = false;
            this.lastCameraName = this.activeCameraName;
            this.activeCamera = this.cameras[this.activeCameraName];
            document.getElementById("camera").innerHTML = this.activeCameraName;

            // call on resize to update the camera aspect ratio
            // among other things
            this.onResize();

            // are the controls yet?
            if (this.controls === null) {
                // Orbit controls allow the camera to orbit around a target.
                this.controls = new OrbitControls(
                    this.activeCamera,
                    this.renderer.domElement
                );
                this.controls.enableZoom = true;
                this.controls.update();
            } else {
                this.controls.object = this.activeCamera;

                if (this.cameras[this.activeCameraName]?.targetFollow) {
                    this.controls.enabled = false;

                    this.controls.target =
                        this.cameras[this.activeCameraName].camTarget.position;
                } else {
                    this.controls.enabled = true;
                    this.controls.target =
                        this.cameras[this.activeCameraName].targetCoords ||
                        new THREE.Vector3(0, 0, 0);
                }
            }
        }
    }

    /**
     * the window resize handler
     */
    onResize() {
        if (this.activeCamera !== undefined && this.activeCamera !== null) {
            this.activeCamera.aspect = window.innerWidth / window.innerHeight;
            this.activeCamera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }
    /**
     *
     * @param {MyContents} contents the contents object
     */
    setContents(contents) {
        this.contents = contents;
    }

    /**
     *
     * @param {Dictionary}
     */
    addCameras(cameras) {
        // to signal that new cameras exist
        this.updateCameras = true;

        Object.keys(cameras).forEach((key) => {
            this.cameras[key] = cameras[key];
        });
    }

    /**
     * the main render function. Called in a requestAnimationFrame loop
     */
    render() {
        this.stats.begin();
        this.updateCameraIfRequired();

        // update the animation if contents were provided
        if (this.activeCamera !== undefined && this.activeCamera !== null) {
            this.contents.update(this.clock.getDelta());
        }

        // required if controls.enableDamping or controls.autoRotate are set to true
        this.controls?.update();

        // render the scene
        this.renderer.setRenderTarget(null);
        this.renderer.render(this.scene, this.activeCamera);

        if (
            this.updateBigScreensClock.getElapsedTime() >
            this.updateBigScreensTime
        ) {
            this.renderer.setRenderTarget(this.target);
            this.renderer.render(this.scene, this.activeCamera);

            this.appMaterial.map = this.framebufferTexture;

            // reset
            this.updateBigScreensClock.start();
        }

        // subsequent async calls to the render loop
        requestAnimationFrame(this.render.bind(this));

        // this.lastCameraName = this.activeCameraName;
        this.stats.end();
    }
}

export { MyApp };
