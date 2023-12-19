import * as THREE from "three";
import { MyAxis } from "./MyAxis.js";
import { MyFileReader } from "./parser/MyFileReader.js";
import * as Utils from "./MyUtils.js";
import { MyTrack } from "./MyTrack.js";
import { instantiateNode } from "./GraphBuilder.js";
import { MyHud } from "./MyHud.js";
import { MyFloor } from "./MyFloor.js";
import { MyCar } from "./MyCar.js";
import { GameManager } from "./manager/GameManager.js";

/**
 *  This class contains the contents of out application
 */
class MyContents {
    /**
       constructs the object
       @param {MyApp} app The application object
    */
    constructor(app) {
        this.app = app;
        this.axis = null;
        // global settings
        this.background = null;
        this.ambient = null;
        // textures
        this.textures = new Object();
        // materials
        this.materials = new Object();
        // primitive materials, polygon is the only primitive with a material assigned
        this.primitiveMaterials = [];
        //skyboxes
        this.skyboxes = new Object();
        //cameras
        this.cameras = new Object();
        //nodes
        this.nodes = new Object();

        // custom parameter for our scene
        this.curtains = [];

        //lights
        this.lights = new Object();

        this.lightsArray = [];

        // game manager
        this.manager = new GameManager(this);

        // show debug gizmos
        this.DEBUG = false;

        this.wireframe = false;

        this.lightsOn = true;

        this.scenePath = "scenes/scene1/";

        this.reader = new MyFileReader(app, this, this.onSceneLoaded);
        this.reader.open(this.scenePath + "demo.xml");
    }

    /**
     * Initializes the contents
     */
    init() {
        // create once
        if (this.axis === null) {
            // create and attach the axis to the scene
            this.axis = new MyAxis(this);
            this.app.scene.add(this.axis);
        }
    }

    /**
     * Called when the scene xml file load is complete
     * @param {MySceneData} data the entire scene data object
     */
    onSceneLoaded(data) {
        console.info(
            "scene data loaded " +
                data +
                ". visit MySceneData javascript class to check contents for each data item."
        );
        this.onAfterSceneLoadedAndBeforeRender(data);

        // register when keys are down
        document.addEventListener("keydown", (keyData) =>
            this.manager.keyboard.setKeyDown(keyData.key)
        );
        // register when keys are up
        document.addEventListener("keyup", (keyData) =>
            this.manager.keyboard.setKeyUp(keyData.key)
        );
    }

    /**
     * Output the object to the console
     * @param {*} obj
     * @param {*} indent
     */
    output(obj, indent = 0) {
        console.log(
            "" +
                new Array(indent * 4).join(" ") +
                " - " +
                obj.type +
                " " +
                (obj.id !== undefined ? "'" + obj.id + "'" : "")
        );
    }

    /**
     * Actual loading of the scene
     * @param {*} data
     */
    onAfterSceneLoadedAndBeforeRender(data) {
        // refer to descriptors in class MySceneData.js
        // to see the data structure for each item

        this.output(data.options);
        this.setOptions(data.options);

        if (data.fog) {
            const fogColor = new THREE.Color(
                data.fog.r,
                data.fog.g,
                data.fog.b
            );
            this.app.scene.fog = new THREE.Fog(
                fogColor,
                data.fog.near,
                data.fog.far
            );
        }

        console.log("textures:");
        for (var key in data.textures) {
            let texture = data.textures[key];
            this.output(texture, 1);
            this.addTexture(texture);
        }

        console.log("materials:");
        for (var key in data.materials) {
            let material = data.materials[key];
            this.output(material, 1);
            this.addMaterial(material);
        }

        // first and only skybox is called "default"
        this.output(data.skyboxes["default"]);

        console.log("skyboxes:", data.skyboxes);
        for (var key in data.skyboxes) {
            let skybox = data.skyboxes[key];
            this.output(skybox, 1);
            this.addSkybox(skybox);
        }

        this.app.scene.add(this.skyboxes["default"]);

        console.log("cameras:");
        for (var key in data.cameras) {
            let camera = data.cameras[key];
            this.output(camera, 1);
            this.addCamera(camera);
        }

        console.log("racetrack", data.racetrack.id);
        this.track = new MyTrack(this, data.racetrack, 100);
        this.app.scene.add(this.track);

        for (let carIdx = 0; carIdx < data.cars.length; carIdx++) {
            const carData = data.cars[carIdx];

            this.manager.addCar(new MyCar(this, data, carData));
        }

        console.log("hud", data.hud.id);
        this.hud = new MyHud(this, data.hud);
        this.app.scene.add(this.hud);

        console.log("floor", data.hud.id);
        this.floor = new MyFloor(this);
        this.app.scene.add(this.floor);

        console.log("nodes:");
        const rootNode = instantiateNode(data.rootId, data, this);

        this.app.scene.add(rootNode);

        // add cameras to the app object
        this.app.addCameras(this.cameras);
        this.app.setActiveCamera(data.activeCameraId);
    }

    update(delta) {
        this.hud.updateHud(752);

        if (this.manager.state) {
            this.manager.update(delta);
        }
    }

    /**
     * Does the necessary changes to the scene based on the options received
     * @param {*} options
     */
    setOptions(options) {
        const ambientColor = new THREE.Color(
            options.ambient.r,
            options.ambient.g,
            options.ambient.b
        );
        const light = new THREE.AmbientLight(ambientColor, 1);

        this.app.scene.add(light);

        const backgroundColor = new THREE.Color(
            options.background.r,
            options.background.g,
            options.background.b
        );
        this.app.scene.background = backgroundColor;
    }

    /**
     * Adds a texture to the textures array
     * @param {*} texture
     */
    addTexture(texture) {
        let newTexture = new THREE.TextureLoader().load(texture.filepath);

        newTexture.magFilter = Utils.getMagFilterFromString(texture.magFilter);
        newTexture.minFilter = Utils.getMinFilterFromString(texture.minFilter);
        newTexture.anisotropy = texture.anisotropy;

        if (!texture.mipmaps && texture.mipmap0) {
            newTexture.generateMipmaps = false;
            newTexture.needsUpdate = true;

            const mipmaps = [
                "mipmap0",
                "mipmap1",
                "mipmap2",
                "mipmap3",
                "mipmap4",
                "mipmap5",
                "mipmap6",
                "mipmap7",
            ];

            for (let index = 0; index < mipmaps.length; index++) {
                const name = mipmaps[index];

                const mipmapText = texture[name];

                if (!mipmapText) break;

                new THREE.TextureLoader().load(
                    mipmapText,
                    function (mipmapTexture) {
                        const canvas = document.createElement("canvas");
                        const ctx = canvas.getContext("2d");
                        ctx.scale(1, 1);

                        // const fontSize = 48
                        const img = mipmapTexture.image;
                        canvas.width = img.width;
                        canvas.height = img.height;

                        // first draw the image
                        ctx.drawImage(img, 0, 0);

                        // set the mipmap image in the parent texture in the appropriate level
                        newTexture.mipmaps[index] = canvas;
                    },
                    undefined, // onProgress callback currently not supported
                    function (err) {
                        console.error(
                            "Unable to load the image " +
                                path +
                                " as mipmap level " +
                                level +
                                ".",
                            err
                        );
                    }
                );
            }
        } else if (texture.isVideo) {
            const video = document.createElement("video");
            video.id = "video";
            video.playsinline = true;
            video.setAttribute("webkit-playsinline", ""); // Webkit specific attribute
            video.muted = true;
            video.loop = true;
            video.autoplay = true;
            video.width = 640;
            video.height = 360;

            video.src = texture.filepath;
            video.style.display = "none";

            document.body.appendChild(video);

            newTexture = new THREE.VideoTexture(video);
            newTexture.needsUpdate = true;
        } else {
            newTexture.generateMipmaps = true;
            if (!texture.mipmaps)
                // mipmaps should be true if no mipmap textures are given
                console.error(
                    "texture",
                    texture.id,
                    "has mipmaps false but has no mipmap textures"
                );
        }

        this.textures[texture.id] = newTexture;
    }

    /**
     * Adds a material to the materials array
     * @param {*} material
     */
    addMaterial(material) {
        // Create a THREE.Color object with RGB values
        const materialColor = new THREE.Color(
            material.color.r,
            material.color.g,
            material.color.b
        );

        let intSides = material.twosided ? THREE.DoubleSide : THREE.FrontSide;

        let shadingBool = material.shading === "flat";

        const newMaterial = new THREE.MeshPhongMaterial({
            color: materialColor,
            specular: material.specular,
            emissive: material.emissive,
            map: this.textures[material.textureref || null]?.clone(),
            shininess: material.shininess,
            flatShading: shadingBool,
            wireframe: material.wireframe || false,
            bumpMap: this.textures[material.bumpref || null],
            bumpScale: material.bumpscale || 1.0,
            specularMap: this.textures[material.specularref || null],
        });

        newMaterial.texlength_s = material.texlength_s || 1;
        newMaterial.texlength_t = material.texlength_t || 1;

        if (material.color.a == 1) {
            newMaterial.opacity = 1;
        } else {
            newMaterial.opacity = material.color.a;
        }

        newMaterial.side = intSides;
        newMaterial.wireframeValue = material.wireframe || false;

        this.materials[material.id] = newMaterial;
    }

    /**
     *
     * @param {SkyboxData} camera
     * creates a skybox based on the data received and adds to the skyboxes array
     */
    addSkybox(skybox) {
        const skyboxObj = new THREE.Object3D();

        const sizeX = skybox.size[0];
        const sizeY = skybox.size[1];
        const sizeZ = skybox.size[2];

        const center = skybox.center;
        const emissiveIntensity = skybox.emissiveIntensity;

        const emissiveColor = new THREE.Color(
            skybox.emissive.r,
            skybox.emissive.g,
            skybox.emissive.b
        );

        const materials = [];

        ["right", "left", "up", "down", "front", "back"].forEach((side) => {
            const texture = new THREE.TextureLoader().load(
                this.scenePath + skybox[side]
            );
            const material = new THREE.MeshPhongMaterial({
                map: texture,
                emissiveMap: texture,
                emissive: emissiveColor,
                emissiveIntensity,
                side: THREE.BackSide,
            });

            materials.push(material);
        });

        const geo = new THREE.BoxGeometry(sizeX, sizeY, sizeZ);

        skyboxObj.add(new THREE.Mesh(geo, materials));

        skyboxObj.translateX(center[0]);
        skyboxObj.translateY(center[1]);
        skyboxObj.translateZ(center[2]);

        this.skyboxes[skybox.id] = skyboxObj;
    }

    /**
     *
     * @param {CameraData} camera
     * creates a camera based on the data received and adds to the cameras array
     */
    addCamera(camera) {
        let newCamera = undefined;

        if (camera.type == "perspective") {
            newCamera = new THREE.PerspectiveCamera(
                camera.angle,
                undefined,
                camera.near,
                camera.far
            );

            newCamera.targetCoords = new THREE.Vector3(
                camera.target[0],
                camera.target[1],
                camera.target[2]
            );
        } else if (camera.type == "orthogonal") {
            newCamera = new THREE.OrthographicCamera(
                camera.left,
                camera.right,
                camera.top,
                camera.bottom,
                camera.near,
                camera.far
            );

            newCamera.targetCoords = new THREE.Vector3(
                camera.target[0],
                camera.target[1],
                camera.target[2]
            );
        } else return;

        newCamera.position.set(
            camera.location[0],
            camera.location[1],
            camera.location[2]
        );

        const target = new THREE.Object3D();
        target.position.set(
            camera.target[0],
            camera.target[1],
            camera.target[2]
        );

        newCamera.target = target;

        this.cameras[camera.id] = newCamera;
    }

    /**
     *
     * Turns on/off the wireframe in the this.materials array
     */
    toggleWireframe(value) {
        for (
            let index = 0;
            index < Object.keys(this.materials).length;
            index++
        ) {
            const material = this.materials[Object.keys(this.materials)[index]];

            material.wireframe = value || material.wireframeValue;
        }

        this.primitiveMaterials.forEach(
            (material) => (material.wireframe = value)
        );
    }

    /**
     * Allows the movement of the curtains through the GUI
     * @param {*} value
     */
    moveCurtains(value) {
        for (let index = 0; index < this.curtains.length; index++) {
            const curtain = this.curtains[index];

            curtain.scale.y = value;
        }
    }

    /**
     * Resets the lights to their original value
     */
    resetLights() {
        for (let index = 0; index < this.lightsArray.length; index++) {
            const lightInfo = this.lightsArray[index];

            lightInfo.light.intensity = lightInfo.defaultEnabled
                ? lightInfo.originalIntensity
                : 0;
        }
    }

    /**
     * Allows the alternation of the scene's lights
     * @param {*} value
     */
    toggleLights(value) {
        for (let index = 0; index < this.lightsArray.length; index++) {
            const lightInfo = this.lightsArray[index];

            lightInfo.light.intensity = value ? lightInfo.originalIntensity : 0;
        }
    }
}

export { MyContents };
