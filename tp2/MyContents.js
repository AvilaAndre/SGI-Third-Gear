import * as THREE from "three";
import { MyAxis } from "./MyAxis.js";
import { MyFileReader } from "./parser/MyFileReader.js";
import * as Utils from "./MyUtils.js";
import { MyNurbsBuilder } from "./MyNurbsBuilder.js";
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
        this.materials = [];
        //cameras
        this.cameras = new Object();
        //nodes
        this.nodes = new Object();

        this.reader = new MyFileReader(app, this, this.onSceneLoaded);
        this.reader.open("scenes/demo/demo.xml");
    }

    /**
     * initializes the contents
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
    }

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

    onAfterSceneLoadedAndBeforeRender(data) {
        // refer to descriptors in class MySceneData.js
        // to see the data structure for each item

        this.output(data.options);

        this.setOptions(data.options);

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
        }

        console.log("cameras:");
        for (var key in data.cameras) {
            let camera = data.cameras[key];
            this.output(camera, 1);
            this.addCamera(camera);
        }

        console.log("nodes:");
        console.log("DEBUG: ", data);
        for (var key in data.nodes) {
            let node = data.nodes[key];

            const nodeObj = new THREE.Object3D();
            this.output(node, 1);
            this.applyTransformations(nodeObj, node.transformations);
            for (let i = 0; i < node.children.length; i++) {
                let child = node.children[i];

                if (child.type === "primitive") {
                    console.log(
                        "" +
                            new Array(2 * 4).join(" ") +
                            " - " +
                            child.type +
                            " with " +
                            child.representations.length +
                            " " +
                            child.subtype +
                            " representation(s)"
                    );
                    const geometry = this.createPrimitive(child);

                    if (geometry !== undefined)
                        nodeObj.add(new THREE.Mesh(geometry));

                    this.app.scene.add(nodeObj);

                    if (child.subtype === "nurbs") {
                        console.log(
                            "" +
                                new Array(3 * 4).join(" ") +
                                " - " +
                                child.representations[0].controlpoints.length +
                                " control points"
                        );
                    }
                } else {
                    this.output(child, 2);
                    //node ref!
                }
            }
        }
        //this.app.scene.add(this.nodes[data.rootId]);

        // add cameras to the app object
        this.app.addCameras(this.cameras);
        this.app.setActiveCamera(data.activeCameraId);

        // reinitialize gui
        this.app.gui.init();
    }

    update() {}

    setOptions(options) {
        this.background = JSON.stringify(options.background) || 0;
        this.ambient = JSON.stringify(options.ambient) || 0;
    }

    addTexture(texture) {
        const newTexture = new THREE.Texture(
            texture.filepath,
            undefined,
            undefined,
            undefined,
            Utils.getMagFilterFromString(texture.magFilter),
            Utils.getMinFilterFromString(texture.minFilter),
            undefined,
            undefined,
            texture.anisotropy
        );

        this.textures[texture.id] = newTexture;
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
        } else if (camera.type == "orthogonal") {
            newCamera = new THREE.OrthographicCamera(
                camera.left,
                camera.right,
                camera.top,
                camera.bottom,
                camera.near,
                camera.far
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

    createPrimitive(child) {
        if (child.subtype === "cylinder") {
            return new THREE.CylinderGeometry(
                child.representations[0]["top"],
                child.representations[0]["base"],
                child.representations[0]["height"],
                child.representations[0]["slices"],
                child.representations[0]["stacks"],
                child.representations[0]["capsclose"],
                child.representations[0]["thetastart"],
                child.representations[0]["thetalength"]
            );
        } else if (child.subtype === "rectangle") {
            const point1 = child.representations[0]["xy1"];
            const point2 = child.representations[0]["xy2"];

            return new THREE.PlaneGeometry(
                point2[0] - point1[0],
                point2[1] - point1[1],
                child.representations["parts_x"],
                child.representations["parts_y"]
            );
        } else if (child.subtype === "triangle") {
            return new THREE.Triangle(
                new Vector3(
                    child.representations[0]["xyz1"][0],
                    child.representations[0]["xyz1"][1],
                    child.representations[0]["xyz1"][2]
                ),
                new Vector3(
                    child.representations[0]["xyz2"][0],
                    child.representations[0]["xyz2"][1],
                    child.representations[0]["xyz2"][2]
                ),
                new Vector3(
                    child.representations[0]["xyz3"][0],
                    child.representations[0]["xyz3"][1],
                    child.representations[0]["xyz3"][2]
                )
            );
        } else if (child.subtype === "sphere") {
            return new THREE.SphereGeometry(
                child.representations["radius"],
                child.representations["slices"],
                child.representations["stacks"],
                child.representations["phistart"],
                child.representations["philength"],
                child.representations["thetastart"],
                child.representations["thetalength"]
            );
        } else if (child.subtype === "nurbs") {
            const degree_v = child.representations[0]["degree_v"];
            const degree_u = child.representations[0]["degree_u"];
            const num_pts = child.representations[0].controlpoints.length;
            const controlpoints = [];

            for (let i = 0; i < num_pts / (degree_u + 1); i++) {
                const pt_to_add = [];
                for (let j = 0; j < degree_v + 1; j++) {
                    const point =
                        child.representations[0].controlpoints[
                            i * (degree_u + 1) + j
                        ];
                    pt_to_add.push([point.xx, point.yy, point.zz]);
                }
                controlpoints.push(pt_to_add);
            }

            return new MyNurbsBuilder().build(
                controlpoints,
                degree_u,
                degree_v,
                child.representations[0]["parts_u"],
                child.representations[0]["parts_v"]
            );
        } else if (child.subtype === "box") {
            const point1 = child.representations[0]["xyz1"];
            const point2 = child.representations[0]["xyz2"];

            return new THREE.BoxGeometry(
                point2[0] - point1[0],
                point2[1] - point1[1],
                point2[2] - point1[2],
                child.representations["parts_x"],
                child.representations["parts_y"],
                child.representations["parts_z"]
            );
        } else {
            console.error("Can't create primitive: ", child.subtype);
            return undefined;
        }
        // ("model3d");
        // ("skybox");
    }

    applyTransformations(node, transformations) {
        transformations.forEach((key) => {
            switch (key.type) {
                case "T":
                    node.position.x += key.translate[0];
                    node.position.y += key.translate[1];
                    node.position.z += key.translate[2];
                    break;
                case "S":
                    node.scale.x += key.scale[0];
                    node.scale.y += key.scale[1];
                    node.scale.z += key.scale[2];
                    break;
                case "R":
                    node.rotation.x += key.rotation[0];
                    node.rotation.y += key.rotation[1];
                    node.rotation.z += key.rotation[2];
                    break;
            }
        });
    }
}

export { MyContents };
