import * as THREE from "three";
import { MyContents } from "../MyContents.js";
import { NumbersComponent } from "./components/NumbersComponent.js";
import { HudComponent } from "./HudComponent.js";
/**
 * This class contains a hud
 */
class MyHud extends THREE.Object3D {
    /**
     * Contains the data being displayed on the screen
     * @param {MyContents} contents the contents object
     * @param {Object} data the path of the hud
     */
    constructor(contents, data) {
        super();
        this.contents = contents;
        this.type = "Group";
        this.path = data.path;
        this.timeElapsed = data.timeElapsed[0].timeFloat;
        this.laps = data.laps[0].value;
        this.speed = data.speedometer[0].value;
        this.timeLeftBenefit = data.timeLeftBenefit[0].timeFloat;
        this.timeLeftPenalty = data.timeLeftPenalty[0].timeFloat;
        this.states = data.states[0].stateValue;

        this.spriteScale = 0.1;

        // Store components as a key value pair
        this.components = {};
    }

    /**
     * Updates the information of every component held
     */
    updateHudComponents() {
        for (let i = 0; i < Object.keys(this.components).length; i++) {
            const component = this.components[Object.keys(this.components)[i]];

            // updates if exists
            component?.update();
        }
    }

    /**
     * Updates the position of the HUD so it always shows in front of the camera
     */
    update() {
        if (!this.visible) return;

        const activeCamera = this.contents.app.getActiveCamera();

        const cameraWorldPosition = new THREE.Vector3();
        const cameraWorldDirection = new THREE.Vector3();

        activeCamera.getWorldPosition(cameraWorldPosition);
        activeCamera.getWorldDirection(cameraWorldDirection);

        const hudPosition = cameraWorldPosition
            .clone()
            .add(cameraWorldDirection);

        this.position.set(...hudPosition);

        this.lookAt(cameraWorldPosition);

        this.updateHudComponents();
    }

    /**
     * Adds a new component to this HUD assigning it a name
     * @param {string} componentName
     * @param {HudComponent} component
     */
    addComponent(componentName, component) {
        this.components[componentName] = component;
        this.add(component);
    }

    /**
     * Removes a component from the HUD
     * @param {*} componentName
     */
    removeComponent(componentName) {
        const component = this.components[componentName];
        this.remove(component);
        delete this.components[componentName];
    }

    /**
     * Retrieves a component by its name.
     * @param {string} componentName - The name of the component to retrieve.
     * @returns {HudComponent | undefined} The component, if found; otherwise, undefined.
     */
    getComponent(componentName) {
        return this.components[componentName];
    }

    /**
     * Retrieves the name of a component by its name.
     * @param {string} componentName - The name of the component to retrieve.
     * @returns {string | undefined} The name of the component, if found; otherwise, undefined.
     */
    getName(componentName) {
        return this.components[componentName].name;
    }
}

MyHud.prototype.isGroup = true;

export { MyHud };
