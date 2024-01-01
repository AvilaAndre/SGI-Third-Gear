import * as THREE from "three";
import { GameState } from "../GameState.js";
import { PickingManager } from "../PickingManager.js";
import { LettersComponent } from "../../hud/components/LettersComponent.js";

/**
 * This class contains methods of  the game
 */
class FinalMenuState extends GameState {
    constructor(contents, manager) {
        super(contents, manager);

        this.pickingManager = new PickingManager(this.contents, [
            "startButton",
            "easyButton",
            "mediumButton",
            "hardButton",
        ]);

        if (this.manager.difficulty == null) {
            this.manager.difficulty = 1;
        }

        this.createHud();

        if (this.manager.playerPickedCar == null) {
            this.manager.playerPickedCar = "hatchback-popup";
        }

        if (this.manager.cpuPickedCar == null) {
            this.manager.cpuPickedCar = "race";
        }

        this.addCarsToScene();
    }

    update(delta) {
        //this.manager.launchFireworks();
    }

    addCarsToScene() {
        const playerCarName = this.manager.playerPickedCar;
        const cpuCarName = this.manager.cpuPickedCar;

        // Create an array of the two car names you want to add
        const carNamesToAdd = [playerCarName, cpuCarName];

        // Loop through each car name to add
        for (let i = 0; i < carNamesToAdd.length; i++) {
            const carName = carNamesToAdd[i];
            const car = this.manager.cars[carName];

            if (car) {
                // Position the car based on its index
                // Adjust this logic if you want a different positioning strategy
                car.position.set(
                    3 * (i - Math.floor(carNamesToAdd.length / 2)),
                    0,
                    0
                );

                // Add the car to the scene
                this.contents.app.scene.add(car);
            }
        }
    }

    onPointerClick(event) {
        const buttonPicked = this.pickingManager.getNearestObject(event)?.name;
    }

    onPointerMove(event) {
        this.pickingManager.onPointerMove(event);
    }

    createHud() {
        this.manager.hud.addComponent(
            "difficulty",
            new LettersComponent(
                new THREE.Vector2(-1.05, -0.45),
                0.07,
                () => {},
                "Difficulty: ",
                5,
                0.06
            )
        );

        this.manager.hud.addComponent(
            "difficultyLevel",
            new LettersComponent(
                new THREE.Vector2(-1.05, -0.5),
                0.07,
                () => {},
                this.manager.difficulty,
                5,
                0.06
            )
        );

        this.manager.hud.addComponent(
            "playerTime",
            new LettersComponent(
                new THREE.Vector2(-0.15, -0.45),
                0.07,
                () => {},
                "Player time: ",
                5,
                0.06
            )
        );

        this.manager.hud.addComponent(
            "playerTimeNumber",
            new LettersComponent(
                new THREE.Vector2(-0.15, -0.5),
                0.07,
                () => {},
                "(tempo)",
                5,
                0.06
            )
        );

        this.manager.hud.addComponent(
            "opponentTime",
            new LettersComponent(
                new THREE.Vector2(0.65, -0.45),
                0.07,
                () => {},
                "Opponent time: ",
                5,
                0.06
            )
        );

        this.manager.hud.addComponent(
            "opponentTimeNumber",
            new LettersComponent(
                new THREE.Vector2(0.65, -0.5),
                0.07,
                () => {},
                "(tempo)",
                5,
                0.06
            )
        );
    }
}

export { FinalMenuState };
