# [mn] medianet system roll-out

This directory contains scripts used to convert an almost-vanilla Raspbian
image into a medianet distribution. The process is as follows:

## Creating a base image

FIXME: This should eventually be turned into a script for true continuous
integration, but the process is somewhat non-trivial to automate.

1. Download the latest **Raspbian lite** image from
[https://downloads.raspberrypi.org/raspbian_lite_latest] (tested with Stretch, requalify for newer Debian versions).
1. Unzip image.
1. Insert empty SD card into reader, determine device name with: ```sudo fdisk -l```
1. Copy image to SD memory card: sudo ```dd if=/your/path/to/raspbian.img of=/dev/<whatyoudeterminedbefore> bs=4M status=progress```
1. Mount the boot partition of that card, save contents somewhere else. Unmount.
1. With gparted or similar tool:
   1. Delete boot partition. 
   1. Move root partition to leave 256MiB free space before and resize to 3840MiB. 
   1. Recreate new boot partition in first unused area, leaving 4MiB free space before, with size 252MiB. Format as fat32.
   1. Create new data partition in unused area at end, leaving no free space before, with size 3073MiB. Format as ext4.
   1. Apply changes.
   1. Re-label boot partition as "boot" and new data partition as "data".
1. Mount boot partition.
1. As root, copy previously stored boot contents back to new boot partition.
1. As root, create a file ```ssh``` in boot partition to enable remote login with default user *pi*, password *raspberry*. Docs say it can be empty, but its more robust to have it contain a single "\n".
1. As root, determine the PARTUUID of the root partition (number two on the card): ```blkid /dev/<whatyoudeterminedbefore>2```
1. Edit boot/cmdline.txt, remove init= string (we do not want to autoresize), insert correct root PARTUUID.
1. Mount root partition.
1. Edit root/etc/fstab, entering correct partition IDs for /boot and /root.
1. Unmount all card partitions.
1. Create card image with dd if=/dev/<whatyoudeterminedbefore> of=YYYY-MM-DD_medianet_base_image.img bs=4M count=2048 status=progress.

## Bootstrapping the system

After booting the system image created above in a Raspberry Pi, it will have
to be turned into a medianet system, which requires three remote logins
followed by a reboot.

1. Basic setup
   1. Log into the system as user *pi* with default password *raspberry* (this opens a window of vulnerability and should only be done on a trusted private network).
   1. Change into [10-basics-as_user_pi] and execute the symlinks in numerical order, carefully noting any error messages in the output. The final one will reboot the system
   1. Drop your own public key into ```/home/medianet/.ssh/authorized_keys```, since the one installed by default is ours and the private key is not part of this repository
1. Customization
   1. Log into the system as the user *medianet* with the appropriate public key.
   1. Change into [50-customize-as_user_medianet] and again execute the symlinks in numerical order.
1. Finish (optional)
   1. Log in a last time as user medianet. By now the system is in its default read-only state and can be used.
   1. Change into [90-finish-as_user_medianet] and repeat. The only remaining step is to upgrade the kernel to the latest version, which will necessitate another reboot.



