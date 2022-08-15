# [mn] medianet developer info

From August 15 2022 onwards, we maintain two distinct
branches. 

> If you have cloned the repo before that date, you are advised
> to delete your local repo and start over, because I made some stupid
> mistakes on the way.

## bullseye64

This is based on the 64-bit image of RaspiOS. All new feature development
should happen here.

## bullseye

This is based on the 32-bit image of RaspiOS. It was branched off of
bullseye64, and has one additional commit with all the differences for
32-bit. From then on, `bullseye64` is periodically merged into `bullseye`.

