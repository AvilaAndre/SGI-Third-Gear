import * as THREE from "three";
import { MyApp } from "../MyApp.js";
import { RaceState } from "./states/RaceState.js";
import { GameState } from "./GameState.js";
import { KeyboardManager } from "./KeyboardManager.js";
import { PlayerParkState } from "./states/PlayerParkState.js";
/**
 * This class contains and manages information about the game
 */
class GameManager {
    /**
     *
     * @param {MyApp} app the application object
     */
    constructor(app) {
        this.app = app;
        this.state = new RaceState(this.app, this); // FIXME: We do not start in race state
        this.keyboard = new KeyboardManager();

        this.cars = [];

        this.car = null;
    }

    setState(state) {
        switch (state) {
            case "race":
                this.state = new RaceState(this.app, this);
                break;
            case "pickingPlayer":
                this.state = new PlayerParkState(this.app, this);
                break;

            default:
                this.state = new GameState(this.app, this);
                break;
        }
        this.state = state;
    }

    update(delta) {
        this.state.update(delta);
        this.keyboard.update();
    }

    addCar(car) {
        this.cars.push(car);

        this.car = car; // FIXME: Remove this when car selection is done

        this.app.app.scene.add(this.car);
    }
}

export { GameManager };
