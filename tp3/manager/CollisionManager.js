import { MyContents } from "../MyContents.js";
import { Collider } from "../collisions/Collider.js";
import { ColliderPruningTree } from "../collisions/ColliderPrunningTree.js";

/**
 * This class contains and manages information about the keyboard
 */
class CollisionManager {
    /**
     * Creates a manager that holds colliders
     * @param {MyContents} contents
     */
    constructor(contents) {
        this.contents = contents;

        this.staticColliders = new ColliderPruningTree();
        this.dynamicColliders = [];
    }

    /**
     * Adds a collider to this manager, if it is flagged as static, it gets added to a collider pruning tree.
     * @param {Collider} collider
     * @param {boolean} isStatic signals if an object needs updating or not
     */
    addCollider(collider, isStatic = false) {
        if (isStatic) this.staticColliders.addCollider(collider);
        else this.dynamicColliders.push(collider);
    }

    /**
     * Does not remove dynamic colliders
     * @param {Collider} collider
     * @returns {boolean} if the removal was successful
     */
    removeCollider(collider) {
        for (let i = 0; i < this.dynamicColliders.length; i++) {
            const element = this.dynamicColliders[i];

            if (element == collider) {
                this.dynamicColliders.splice(i, 1);
                return true;
            }
        }

        return false;
    }

    /**
     * updates the colliders values of those that are dynamic
     * @param {number} _delta
     */
    update(_delta) {
        this.dynamicColliders.forEach((element) => {
            element.update();
        });
    }

    /**
     * Checks for collisions
     * @param {Collider} collider
     * @returns {Collider} null if does not collide with another collider
     */
    checkCollisions(collider) {
        // Check for static collisions first
        const staticCollisionResult = this.staticColliders.collide(collider);
        if (staticCollisionResult) return staticCollisionResult;

        // check for dynamic collisions first
        for (let colIdx = 0; colIdx < this.dynamicColliders.length; colIdx++) {
            const otherCollider = this.dynamicColliders[colIdx];
            if (otherCollider == collider) continue;
            if (collider.collide(otherCollider)) return otherCollider;
        }

        return null;
    }
}

export { CollisionManager };
