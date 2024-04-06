import { scaleFactor } from "./contants";
import { k } from "./kaboomCtx";
import { displayDialogue, setCamScale } from "./utils";

k.loadSprite("spritesheet", "./spritesheet.png", {
  sliceX: 39,
  sliceY: 31,
  anims: {
    "idle-down": 936,
    "walk-down": { from: 936, to: 939, loop: true, speed: 8 },
    "idle-side": 975,
    "walk-side": { from: 975, to: 978, loop: true, speed: 8 },
    "idle-up": 1014,
    "walk-up": { from: 1014, to: 1017, loop: true, speed: 8 },
  },
});

k.loadSprite("map", "./map.png");

k.setBackground(k.Color.fromHex("#311047"));

k.scene("main", async () => {
  const mapData = await (await fetch("./map.json")).json();
  const layers = mapData.layers;

  const map = k.add([k.sprite("map"), k.pos(0), k.scale(scaleFactor)]);

  //Player definition
  const player = k.make([
    //we load the spritesheet and connect the default animation
    k.sprite("spritesheet", { anim: "idle-down" }),
    //with this we define the collision of the player
    k.area({
      shape: new k.Rect(k.vec2(0, 3), 10, 10),
    }),
    //body makes the object a tangible body to be collided with
    k.body(),
    //Draw the player from the center instead of the top left corner
    k.anchor("center"),
    //here we define where the player is spawned
    k.pos(),
    k.scale(scaleFactor),
    //Inside this array, whatever is defined will be accessible globally as for instance player.speed
    {
      speed: 250,
      direction: "down",
      isInDialogue: false,
    },
    //defining a tag to the game object, you can use the onCollide function to check for collisions
    "player",
  ]);

  for (const layer of layers) {
    if (layer.name === "boundaries") {
      //This for will iterate trough all the boundaries, which are contained as objects inside an array in the map.json
      for (const boundary of layer.objects) {
        map.add([
          k.area({
            //(k.vec2(0) means that we want the boundary to be positioned in the same place where the game object is positioned
            shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),
          }),
          //This makes sure that the player will not be able to overlap
          k.body({ isStatic: true }),
          //This is the actual position of the boundaries
          k.pos(boundary.x, boundary.y),
          //This will be the tag we discussed already for the player object, but it will be fetch from the json properties of the object
          boundary.name,
        ]);

        if (boundary.name) {
          player.onCollide(boundary.name, () => {
            player.isInDialogue = true;
            displayDialogue("TODO", () => (player.isInDialogue = false));
          });
        }
      }
      continue;
    }

    if (layer.name === "spawnpoints") {
      for (const entity of layer.objects) {
        if (entity.name === "player") {
          player.pos = k.vec2(
            (map.pos.x + entity.x) * scaleFactor,
            (map.pos.y + entity.y) * scaleFactor
          );
          k.add(player);
          continue;
        }
      }
    }
  }

  setCamScale(k);

  k.onResize(() => {
    setCamScale(k);
  });

  k.onUpdate(() => {
    k.camPos(player.pos.x, player.pos.y + 100);
  });

  //This is the function that will be called when the player is moving
  k.onMouseDown((mouseBtn) => {
    if (mouseBtn !== "left" || player.isInDialogue) return;

    //If we use directly k.mousePos() we will get the position of the mouse in the screen, not in the world. Therefore it will get stuck at some point and bug the game
    const worldMousePos = k.toWorld(k.mousePos());
    player.moveTo(worldMousePos, player.speed);

    //Store mouse angle for animation
    const mouseAngle = player.pos.angle(worldMousePos);

    const lowerBound = 50;
    const upperBound = 125;

    if (
      mouseAngle > lowerBound &&
      mouseAngle < upperBound &&
      player.curAnim() !== "walk-up"
    ) {
      player.play("walk-up");
      player.direction = "up";
      return;
    }

    if (
      mouseAngle < -lowerBound &&
      mouseAngle > -upperBound &&
      player.curAnim() !== "walk-down"
    ) {
      player.play("walk-down");
      player.direction = "down";
      return;
    }

    if (Math.abs(mouseAngle) > upperBound) {
      player.flipX = false;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "right";
      return;
    }

    if (Math.abs(mouseAngle) < lowerBound) {
      player.flipX = true;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "left";
      return;
    }

    k.onMouseRelease(() => {
      if (player.direction === "down") {
        player.play("idle-down");
        return;
      }
      if (player.direction === "up") {
        player.play("idle-up");
        return;
      }

      player.play("idle-side");
    });
  });
});

k.go("main");
