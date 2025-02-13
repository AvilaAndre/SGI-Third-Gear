# SGI 2023/2024 - TP2

## Group: T05G07

| Name                           | Number    | E-Mail                   |
| ------------------------------ | --------- | ------------------------ |
| André Ismael Ferraz Ávila      | 202006767 | up202006767@edu.fe.up.pt |
| Maria Sofia B. P. C. Gonçalves | 202006927 | up202006927@edu.fe.up.pt |

---

* The scene created consists of a cat room, that includes cat stairs (smaller than regular human stairs), 4 yarns spreaded across the room, 3 chairs, made of two different materials, a table, a cat scratcher, a poster announcing the cat of the month with a spotlight illuminating it, a knocked down tree, two polygons, 3 windows with a curtain each, 3 panels showing a mischievious kitten's videos, Jinx, The Cat (the little black feline on one corner of the room), 4 walls, a floor and a ceiling.

* The panels have a video texture playing.

* Shadows are utilized in certain objects.
  
* The cat and the sofas have LODs applied.

* A bump texture was used for the floor.

* If the primitive is a rectangle, the dimensions of the geometry are compared with the texture's length (texlength) parameter and the repetition of the texture on the material is calculated.

* If specified, mipmaps can be manually defined, otherwise, they will be automatically generated by ThreeJS.

* The polygon primitive creates a 3D polygon figure that, the more slices it has, the more it resembles a circle. Created with the **BufferGeometry** class, this geometry is the only primitive that includes its own material, the material being a gradient made from the two colors given in the XML specification of the primitive.

* The GUI has the wireframe toggle, that, as it was specified, turns the objects that are not originally wireframes into wireframes and then back to normal, as well as the lights toggle, that turns the intensity of the lights to 0 when toggled off and back to their previous value when toggled on. It also has the active camera selector, individual lights intensity and color selector and a custom parameter that is the curtains, only available on our scene. 


![Screenshot](/tp2/screenshots/print2.png)

![Screenshot](/tp2/screenshots/print3.png)

![Screenshot](/tp2/screenshots/print4.png)

![Screenshot](/tp2/screenshots/print5.png)

![Screenshot](/tp2/screenshots/print6.png)