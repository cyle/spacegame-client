# SpaceGame (Babylon Edition)

Just load index.html into Chrome (or any browser that supports WebGL) and play!

Note that this will not work on a computer that does not have hardware graphics acceleration.

## Current Features

- You can zip around in your blocky spaceship via frictionless Newtonian physics.
- You can run into asteroids (little brown spheres) and bounce away from them upon collision.
- You can hide in nebulas (purple boxes).
- You can park safely inside safe zones (green boxes).
- You can shoot straight ahead (though the bullets don't actually do anything yet).

## Controls

Controls:

- `w` to thrust forward.
- `s` to reverse thrust.
- `a` to rotate left.
- `d` to rotate right.
- `c` to re-center the camera.
- `shift` to decelerate (not the same as reversing thrust).
- `space` to fire straight ahead.

You can move around the camera a little by holding the left mouse button and dragging around.

## About

The general idea I had for my SPACE GAME! was to re-create [Cosmic Rift](http://en.wikipedia.org/wiki/Cosmic_Rift), specifically the "Rogue Trader" zone, where you had a ship (which you could upgrade) and fly around collecting tradable materials and/or shoot the other ships in the zone. With enough money and time, you could even build a little starbase, though they never lasted long. It was a hell of a lot of fun, and I miss it, and I'm surprised nobody has made anything like it since then. At least, the attempts I've seen are usually too complicated and not fun enough.

I'd like to re-create that experience and then expand on it by having more than one "area" to fly around. Instead, I'd like to have a whole galaxy of areas you can travel to, and an elaborate system of space-faring empires you can interact with. Join up with a civilization and get some bonuses (but make enemies with rival civs), or work on your own in the unclaimed systems.

This uses the [Babylon.js](http://www.babylonjs.com/) game engine thing, which is pretty damn neat.

## Planned Features / To-do list

- Bullets actually do damage of some kind.
- A proper HUD, not just a debug HUD.
- Space stations.
- Proper textures / models.
- Mine-able/pick-up-able objects and trading.
- Different ships, weapons, engines, etc.
- Multiplayer via socket.io.
- Travel to other areas after purchasing a hyperdrive.
- Game server that runs the civs, economy, trading, the galaxy, subspace travel.
