# [mn] medianet system roll-out

This directory contains scripts used to convert an almost-vanilla Raspbian
Buster image into a medianet distribution. The process is as follows:

## Create a base image

1. Download the latest **Raspbian lite** image (tested with Buster, requalify for newer releases):  
```wget https://downloads.raspberrypi.org/raspbian_lite_latest```
1. Unzip image:  
```unzip *-raspbian-*-lite.zip```
1. Pad the image file with zeros up to 8GB:  
```truncate -s 7969177600 *-raspbian-*-lite.img```
1. Resize the rootfs partition to 4G, using sectors for proper alignment:  
```parted *-raspbian-*-lite.img resizepart 2 8388607s```
1. Create a localfs partition spanning the remainder of the disk:  
```parted *-raspbian-*-lite.img mkpart primary ext4 8388608s 100%```
1. Create loop devices for the image partitions and find the boot partition:  
```PART=/dev/mapper/`kpartx -av *-raspbian-*-lite.img | grep -o "loop.p1"` ```
1. Mount the boot partition:  
```mount $PART /mnt```
1. Activate SSH login on the image:   
```touch /mnt/ssh```
1. Disable automatic resizing of root partition in Raspbian:  
```sed -i 's/init=[^[:space:]]*//' /mnt/cmdline.txt```
1. Fix kernel commandline link to root fs (the PARTUUID has changed after
editing the partition table):  
```sed -i 's/root=PARTUUID=[^[:space:]]*/root=\/dev\/mmcblk0p2/' /mnt/cmdline.txt```
1. Unmount the boot partition:  
```umount /mnt```
1. Find the new localfs partition:  
```PART=/dev/mapper/`kpartx -av *-raspbian-*-lite.img | grep -o "loop.p3"` ```
1. Create an ext4 file system:  
```mkfs.ext4 -L localfs $PART```
1. Remove the loop devices:  
```kpartx -d *-raspbian-*-lite.img```
1. At this point, it makes sense to rename the image to reflect the customisations:  
```mv *-raspbian-*-lite.img medianet-base.img```

Alternatively, you can use the experimental script ```sbin/mn_make_image```.
Make sure you have at least 9GB free space in the directory where you invoke
it.

## Create an SD card


Now the image is ready to be written to a µ-SD card using the tool of your choice, which is dd:  
```dd if=medianet-base.img of=/dev/$CARDREADER bs=4M status=progress```

## Bootstrap the system

After booting the system image created above in a Raspberry Pi, it will have
to be turned into a medianet system, which requires two remote logins each
followed by a reboot.

1. Log into the system as user *pi* with default password *raspberry* (this opens a window of vulnerability and should only be done on a trusted private network).
```ssh pi@raspberrypi```
1. Check out medianet environment
   1. ```sudo apt-get update```
   1. ```sudo apt-get install git```
   1. ```sudo git clone https://github.com/nettings/medianet.git /medianet```
   1. ```cd /medianet```
1. Basic setup
   1. Change into ```sbin/10-basics-as_user_pi/``` and execute the symlinks in numerical order using ```sudo```, carefully noting any error messages in the output. Do not run the final one (reboot) just yet.
   1. Drop your own public key into ```/home/medianet/.ssh/authorized_keys```, since the one installed by default is ours and the private key is not part of this repository.
   1. Reboot
1. Customization
   1. Log into the system as the user *medianet* with the appropriate public key. The host name is now "mn-basic":
   ```ssh -i $PATH_TO_YOURKEY medianet@mn-basic```
   1. Change into ```sbin/50-customize-as_user_medianet/``` and again execute the symlinks in numerical order using ```sudo```.

## Create a final medianet image

Once your system has been bootstrapped natively, it is probably a good idea to dump the whole system to an image file.
You can either shut down the Pi, remove the card and read it out on your other machine, or (and that works surprisingly well given that the medianet system is meant to run read-only), copy it out from a running system:

1. Make sure your medianet system is running read-only, either by rebooting it or by issuing  
```sudo mn_make_readonly```
1. Make sure you have 8G of space on a machine that you can reach over the network via ssh, and do  
```sudo dd if=/dev/mmcblk0 bs=512 | ssh user@bigmachine ' cat > /home/user/medianet-final.img ' ```

Now is a good time to fetch a coffee.

