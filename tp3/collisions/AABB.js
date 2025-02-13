import * as THREE from "three";

/**
 * This class represents an Axis-aligned Bounding Box Collider
 */
class AABB {
    /**
     * Sets the inital values of the variables present in this class
     * @param {number} minX
     * @param {number} maxX
     * @param {number} minY
     * @param {number} maxY
     */
    constructor(minX, maxX, minY, maxY) {
        this.minX = minX;
        this.maxX = maxX;
        this.minY = minY;
        this.maxY = maxY;
    }

    /**
     * Updates the coordinates of the bounding box
     * @param {number} minX
     * @param {number} maxX
     * @param {number} minY
     * @param {number} maxY
     */
    set(minX, maxX, minY, maxY) {
        this.minX = minX;
        this.maxX = maxX;
        this.minY = minY;
        this.maxY = maxY;
    }

    /**
     * Checks if a point is inside the bounding box
     * @param {THREE.Vector2} point
     * @returns {boolean} if is inside
     */
    isPointInside(point) {
        return (
            point.x >= this.minX &&
            point.x <= this.maxX &&
            point.y >= this.minY &&
            point.y <= this.maxY
        );
    }

    /**
     * Checks if two boxes overlap
     * @param {AABB} box
     * @returns {boolean} if intersects
     */
    intersect(box) {
        return (
            this.minX <= box.maxX &&
            this.maxX >= box.minX &&
            this.minY <= box.maxY &&
            this.maxY >= box.minY
        );
    }
}

export { AABB };
