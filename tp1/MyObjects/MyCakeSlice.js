import * as THREE from "three";
import { MyApp } from "../MyApp.js";

/**
 * This class contains a 3D cakeSlice representation
 */
class MyCakeSlice extends THREE.Object3D {
    /**
     *
     * @param {MyApp} app the application object
     * @param {number} up_radius the radius of the upside of the cakeSlice
     * @param {number} down_radius the radius of the downside of the cakeSlice
     * @param {string} flavor
     */
    constructor(app, flavor) {
        super();
        this.app = app;
        this.type = "Group";
        this.up_radius = 0.25;
        this.down_radius = 0.25;
        this.flavor = flavor;

        this.cakeSliceMaterial = new THREE.MeshPhongMaterial({
            color: "#FFCC80",
            specular: "#6E260E",
            emissive: "#000000",
            shininess: 10,
        });

        if(this.flavor === "strawberry"){
            this.cakeMaterial = new THREE.MeshPhongMaterial({
                color: "#FEC5E5",
                specular: "#6E260E",
                emissive: "#000000",
                shininess: 10,
            });
        } else if (this.flavor === "vanilla"){
            this.cakeMaterial = new THREE.MeshPhongMaterial({
                color: "#FFF6DF",
                specular: "#6E260E",
                emissive: "#000000",
                shininess: 10,
            });
        } else if (this.flavor === "chocolate"){
            this.cakeMaterial = new THREE.MeshPhongMaterial({
                color: "#805A46",
                specular: "#6E260E",
                emissive: "#000000",
                shininess: 10,
            });
        }

        this.cakeSliceGroup = new THREE.Group();

        let cakeSlice = new THREE.CylinderGeometry(
            //Raio  do círculo superior
            this.up_radius,
            //Raio do círculo inferior
            this.down_radius,
            //Altura
            0.1,
            //Segmentos radiais
            40,
            //Segmentos de altura
            3,
            false,
            0,
            Math.PI/4
        );

        ["#805A46", "#FFF6DF", "#FEC5E5"].forEach((color, index) => {
            let cakeMaterial = new THREE.MeshPhongMaterial({
                color,
                specular: "#6E260E",
                emissive: "#000000",
                shininess: 10,
            });

            this.cakeMesh = new THREE.Mesh(cakeSlice, cakeMaterial);
        
            //this.cakeMesh.position.x = -2;
            this.cakeMesh.position.y = 3 + 0.1*index;
            //this.cakeMesh.position.z = -1.5; 


            this.cakeSliceGroup.add(this.cakeMesh)

        })

        /*this.cakeSliceGroup.position.x = -1;
        this.cakeSliceGroup.position.y = 0;
        this.cakeSliceGroup.position.z = -2;
        this.cakeSliceGroup.rotation.x = -Math.PI/3 + Math.PI/9;
        this.cakeSliceGroup.rotation.z = -Math.PI/2;*/

        let planeCake = new THREE.PlaneGeometry( 
            0.25, 
            0.3 
        );




        this.planeLeftCakeMesh = new THREE.Mesh( planeCake, this.cakeSliceMaterial);
        this.planeLeftCakeMesh.position.y = this.cakeMesh.position.y - 0.15;
        this.planeLeftCakeMesh.position.copy(this.cakeMesh.position);
        this.planeLeftCakeMesh.position.y -= 0.1;
        this.planeLeftCakeMesh.position.z += 0.12;
        this.planeLeftCakeMesh.rotation.set(0, -Math.PI/2, 0);


        this.cakeSliceGroup.add(this.planeLeftCakeMesh);
        //this.cakeSliceGroup.add(this.planeRightCakeMesh);



        this.add(this.cakeSliceGroup);
    }
}

MyCakeSlice.prototype.isGroup = true;

export { MyCakeSlice };
