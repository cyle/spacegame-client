# SPACE GAME! Client

Just load index.html into Chrome (or any browser that supports WebGL) and play!

You will need two things: the server hostname/IP and your name. If you are a returning player, use the same name! If not, enter whatever name you want.

Note that this will not work on a computer that does not have hardware graphics acceleration for WebGL. The only thoroughly tested browsers are Chrome and Safari.

## Important Note

After version 0.0.2, this now requires the [**SPACE GAME! server**](https://github.com/cyle/spacegame-server) in order to play. Even if you are playing alone, you need to load that up first. Also note that right now this requires you to have the server running on the same machine you're playing with... so yeah. You'll be playing alone anyway.

Also, this is super alpha, and unstable, and I'm working on it sporadically. Don't be surprised if the documentation is wrong. I'll try to keep this updated as often as I can.

## A SCREENSHOT, WHOA

![a SPACE GAME screenshot](https://raw.github.com/cyle/spacegame-client/master/spacegame-alpha-screenshot.jpg "a SPACE GAME screenshot")

## Current Features

- You can zip around in your blocky spaceship via frictionless Newtonian physics.
- You can run into asteroids (little brown spheres) and bounce away from them upon collision.
- You can hide in nebulae (purple boxes).
- You can park safely inside safe zones (green boxes).
- You can shoot straight ahead (though the bullets don't actually do much yet).
- You can see other people zooming around where you are if you're sharing a server.

## Controls

Controls:

- `w` to forward thrust.
- `s` to reverse thrust.
- `a` to rotate left.
- `d` to rotate right.
- `c` to re-center the camera.
- `shift` to decelerate (not the same as reversing thrust).
- `space` to fire straight ahead.

You can move around the camera a little by holding the left mouse button and dragging around, or using the arrow keys.

## Usage

To get it fully up and running, follow [this guide](USAGE.md).

## About

The general idea I had for my SPACE GAME! was to re-create [Cosmic Rift](http://en.wikipedia.org/wiki/Cosmic_Rift), specifically the "Rogue Trader" zone, where you had a ship (which you could upgrade) and fly around collecting tradable materials and/or shoot the other ships in the zone. With enough money and time, you could even build a little starbase, though they never lasted long. It was a hell of a lot of fun, and I miss it, and I'm surprised nobody has made anything like it since then. At least, the attempts I've seen are usually too complicated and not fun enough.

I'd like to re-create that experience and then expand on it by having more than one "area" to fly around. Instead, I'd like to have a whole galaxy of areas you can travel to, and an elaborate system of space-faring empires you can interact with. Join up with a civilization and get some bonuses (but make enemies with rival civs), or work on your own in the unclaimed systems.

You can read my intentions (or dreams) about the game [here](http://cylesoft.com/blog/space-game-design-doc.html).

This uses the [Babylon.js](http://www.babylonjs.com/) game engine thing, which is pretty damn neat.

## Planned Features / To-do list

- Bullets actually do damage of some kind.
- Space stations.
- Proper textures / models actually working...
- Mine-able/pick-up-able objects and trading.
- Different ships, weapons, engines, etc.
- Travel to other areas after purchasing a hyperdrive.
- Game server that runs the civs, economy, combat, trading, the galaxy, subspace travel.
