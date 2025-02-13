import * as THREE from "three";
import { GameState } from "../GameState.js";
import { PickingManager } from "../PickingManager.js";
import { LettersComponent } from "../../hud/components/LettersComponent.js";
import { ButtonsComponent } from "../../hud/components/ButtonsComponent.js";

/**
 * This class contains the final menu state
 */
class FinalMenuState extends GameState {
    constructor(contents, manager) {
        super(contents, manager);

        this.pickingManager = new PickingManager(this.contents, [
            "menuButton",
            "replayButton",
        ]);

        this.createHud();

        this.addCarsToScene();
    }

    /**
     * Respnsible for launching the fireworks with the passage of time
     * @param {*} delta
     */
    update(delta) {
        this.manager.launchFireworks(delta);
    }

    /**
     * Adds the cars selected by the player (for themselves and for the computer) to the final menu
     **/
    addCarsToScene() {
        const playerCarName = this.manager.playerCar;
        const cpuCarName = this.manager.opponentCar;

        cpuCarName.stopRunAnimation();

        playerCarName.scale.set(2, 2, 2);
        cpuCarName.scale.set(2, 2, 2);

        playerCarName.teleportTo(4, -4, 0);
        cpuCarName.teleportTo(-4, 4, 1.57);

        this.contents.app.scene.add(playerCarName, cpuCarName);
        return;
    }

    /**
     * Called when a click event happens.
     * Checks which button was clicked and switches to the appropriate scene, either the player wants to replay or start a completely new game
     * @param {*} event
     */
    onPointerClick(event) {
        const buttonPicked = this.pickingManager.getNearestObject(event)?.name;

        if (buttonPicked === "menuButton") {
            this.contents.switchScenes("initialMenu");
        } else if (buttonPicked === "replayButton") {
            this.contents.switchScenes("race");
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
     * Creates the final menu's HUD components
     */
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
                this.manager.difficultyLevel,
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
                (this.manager.playerTotalTime.getElapsedTime() / 1000).toFixed(
                    2
                ) + " secs",
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
                (
                    this.manager.opponentTotalTime.getElapsedTime() / 1000
                ).toFixed(2) + " secs",
                5,
                0.06
            )
        );

        this.manager.hud.addComponent(
            "winner",
            new LettersComponent(
                new THREE.Vector2(-0.1, 0.35),
                0.12,
                () => {},
                this.manager.winner + " WON!",
                5,
                0.06
            )
        );

        this.manager.hud.addComponent(
            "loser",
            new LettersComponent(
                new THREE.Vector2(-0.2, -0.35),
                0.07,
                () => {},
                this.manager.loser + " lost...",
                5,
                0.06
            )
        );

        this.manager.hud.addComponent(
            "menuButton",
            new ButtonsComponent(
                new THREE.Vector2(-0.25, -0.1),
                0.1,
                "menuButton.png"
            )
        );

        this.manager.hud.addComponent(
            "replayButton",
            new ButtonsComponent(
                new THREE.Vector2(0.25, -0.1),
                0.1,
                "replayButton.png"
            )
        );

        this.contents.pickables.push(
            this.manager.hud.getComponent("menuButton")
        );
        this.contents.pickables.push(
            this.manager.hud.getComponent("replayButton")
        );
    }
}

export { FinalMenuState };
