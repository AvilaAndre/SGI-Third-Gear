import * as THREE from "three";
import { GameState } from "../GameState.js";
import { PickingManager } from "../PickingManager.js";
/**
 * This class contains methods of  the game
 */
class PlayerParkState extends GameState {
    constructor(contents, manager) {
        super(contents, manager);

        this.pickingManager = new PickingManager(
            this.contents,
            Object.keys(this.manager.cars)
        );

        this.addCarsToScene();


    }

    update(delta) {
        //this.manager.launchFireworks();
    }
    /**
     * Called when a click event happens.
     * Defines which car was chosen by the player to be theirs and stores this information.
     * @param {*} event 
     */
    onPointerClick(event) {
        const carPicked = this.pickingManager.getNearestObject(event)?.name;

        if (carPicked) {
            this.manager.playerPickedCar = carPicked;

            this.contents.switchScenes("opponentPark");
        }
    }

    /**
     * Called when a pointer move event happens
     * @param {*} event 
     */
    onPointerMove(event) {
        this.pickingManager.onPointerMove(event);
    }

    /**
     * Adds every available car to the scene
     */
    addCarsToScene() {
        const carNames = Object.keys(this.manager.cars);

        for (let i = 0; i < carNames.length; i++) {
            const car = this.manager.cars[carNames[i]];

            car.position.set(3 * (i - Math.floor(carNames.length / 2)), 0, 0);

            this.contents.app.scene.add(car);
        }
    }
}

export { PlayerParkState };
