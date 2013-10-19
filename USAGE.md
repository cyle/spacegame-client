# Getting SPACE GAME! Up and Running

Okay so SPACE GAME! currently requires you to be running the *server and client* to even start playing. Annoying? Kind of, but I'm figuring this out, so work with me here. I really want to go the *Minecraft* route and have every universe be seamlessly single player and multiplayer at the same time.

## Installing the SPACE GAME! Server

Get the code from [over here](https://github.com/cyle/spacegame-server) and do what it says.

For my development environment, which is a Mac running Mountain Lion, I'm running MongoDB on an Ubuntu Virtual Machine via VirtualBox. I've used [Gas Mask](https://www.macupdate.com/app/mac/29949/gas-mask) to edit my `/etc/hosts` file (though you can do it manually via Terminal) to map the IP address of that Ubuntu VM to *spacegame.com*. Therefore, the MongoDB calls inside `server.js` go to the right place. You don't have to do anything with MongoDB, just install it and make sure it's running. Schema indexing and whatnot will come sometime down the road.

At this time, you do **not** actually need the [SIGIL database](https://github.com/cyle/sigil) for the SPACE GAME! Server to run. This may change soon, but you'd install it on that VM. You *do need to install* the sigil npm module, though.

Once the VM is up, and *spacegame.com* is pointing to it, you need to make the **starting zone** of your universe. Open up Terminal, go to your `spacegame-server` directory, and run this: `node utils/build-start-area.js`. It should say "done" and exit when it's completed successfully.

Now you can run your SPACE GAME! Server by running `node server.js`. It should spit out some console output, and then it'll remain open and waiting for players.

At this time, you can go to `index.html` in Chrome or Safari and leave "localhost" as the server and put in whatever username you want. The server *will remember you based on your name* unless you wipe the MongoDB database.

That's it! You can't do much more than that right now. But you can zip around and shoot things, and other players can join as well by connecting to your computer's IP address.

## Resetting the MongoDB Database

If you run into problems, like the server not knowing where players are, you can simply wipe the `players` collection in MongoDB. To do this, open up a console session on whatever is holding MongoDB (an Ubuntu VM as described above) via Terminal and ssh or PuTTY or whatever, and run the `mongo` command to jump into MongoDB.

Inside the mongo shell, run `use spacegame` and then `db.players.remove();` to clear the player cache. If you want, you can also run `db.areas.remove();` to clear the zone/area cache, but you will have to run `node utils/build-start-area.js` to make sure people have a place to start when they join the server.