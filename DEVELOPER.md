# [mn] medianet developer info

Currently, all development work happens in the `bookworm` branch, which is
the default. It is meant to be used with a RaspiOS Bookworm 64bit kernel and
userspace. Changes are mainly tested on Raspberry Pi 4B and 5, with
occasional checks on a 3B+.

If you need to run it on even older hardware, just create a system based on
the 32-bit RaspiOS Bookworm image.

##

If you want to hack `medianet`, you will find it's possible to keep the
entire `/medianet` tree chowned to `medianet:medianet` without major ill
effects (ignore the odd error message). This way, it's easy to run git
updates and commits. Of course, this has security implications and is not
recommended for a production system.

These tools are your friend:
```
medianet@YourPi ~ $ /medianet/sbin/mn_setup_developer -h
medianet@YourPi ~ $ /medianet/sbin/mn_git_update_prepare
medianet@YourPi ~ $ sudo /medianet/sbin/mn_deploy_overlay
medianet@YourPi ~ $ sudo /medianet/sbin/mn_clean_links
```

## Legacy versions

From August 2022 to November 2023, there were two distinct
branches:

#### bullseye64

This is based on the 64-bit image of RaspiOS. All new feature development
should happen here.

#### bullseye

This is based on the 32-bit image of RaspiOS. It was branched off of
bullseye64, and has one additional commit with all the differences for
32-bit. From then on, `bullseye64` is periodically merged into `bullseye`.

