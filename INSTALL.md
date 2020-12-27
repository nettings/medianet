# [mn] medianet system roll-out

The `sbin/` directory contains scripts used to convert an almost-vanilla
Raspbian Buster image into a medianet distribution. The process is as follows:

## Automatically create a Raspbian base image
You can use the experimental script `mn_make_image` in `sbin/`. Since the
image creation process is all BASH code, you can check out this repo to any
modern Linux on any architecture, and it will work (i.e. you don't need to run
this on a Pi even though it's part of the medianet repository).

Make sure you have at least 12 GB free space in your output directory.
```
you@yourbigbox: $ ./mn_make_image -h
mn_make_image creates a [mn] medianet base image from a RaspiOS release.

--help         displays this message
 -h

--output-path  an output path where the downloaded RaspiOS image and
 -o            the medianet base image will be stored

--image        a HTTP URL to download or a locally stored image to start
 -i            from; defaults to the latest known-good image, currently
               http://downloads.raspberrypi.org/raspios_lite_armhf/images/raspios_lite_armhf-2020-12-04/2020-12-02-raspios-buster-armhf-lite.zip

--size         the size of the base image in bytes; needs to be big
 -s            enough to contain the original (unzipped) image plus an extra
               local partition - leave alone unless you know what you're doing;
               defaults to 5368709120
```

## Alternative: Manually create a Raspberry Pi OS base image
1. Download the latest **raspios lite** image (tested with Buster, requalify
for newer releases):  
`wget https://downloads.raspberrypi.org/raspios_lite_armhf/images/raspios_lite_armhf-2020-12-04/2020-12-02-raspios-buster-armhf-lite.zip`
1. Unzip image:  
`unzip *-raspios-*-lite.zip`
1. Pad the image file with zeros up to 5 GB:  
`truncate -s 5368709120 *-raspios-*-lite.img`
1. Resize the rootfs partition to 4G, using sectors for proper alignment:  
`parted *-raspios-*-lite.img resizepart 2 8388607s`
1. Create a localfs partition spanning the remainder of the disk:  
`parted *-raspios-*-lite.img mkpart primary ext4 8388608s 100%`
1. Create loop devices for the image partitions and find the boot partition:  
```PART=/dev/mapper/`kpartx -av *-raspios-*-lite.img | grep -o "loop.p1"` ``` 
1. Mount the boot partition:  
`mount $PART /mnt`
1. Activate SSH login on the image:   
`touch /mnt/ssh`
1. Disable automatic resizing of root partition in Raspbian:  
`sed -i 's/init=[^[:space:]]*//' /mnt/cmdline.txt`
1. Fix kernel commandline link to root fs (the PARTUUID has changed after
editing the partition table):  
`sed -i 's/root=PARTUUID=[^[:space:]]*/root=\/dev\/mmcblk0p2/' /mnt/cmdline.txt`
1. Unmount the boot partition:  
`umount /mnt`
1. Find the new localfs partition:  
```PART=/dev/mapper/`kpartx -av *-raspbian-*-lite.img | grep -o "loop.p3"` ```
1. Create an ext4 file system:  
`mkfs.ext4 -L localfs $PART`
1. Remove the loop devices:  
`kpartx -d *-raspios-*-lite.img`
1. At this point, it makes sense to rename the image to reflect the
customisations:  
`mv *-raspios-*-lite.img medianet-base.img`

## Create an SD card
Now the image is ready to be written to a µ-SD card using the tool of your
choice, which is dd:
```
dd if=medianet-base.img of=/dev/$CARDREADER bs=4M status=progress
```

## Bootstrap the system
After booting the system image created above in a Raspberry Pi, it will have
to be turned into a medianet system, which requires two remote logins each
followed by a reboot.

1. Log into the system as user *pi* with default password *raspberry* (this
opens a window of vulnerability and should only be done on a trusted private
network).  
`ssh pi@raspberrypi`
1. Check out medianet environment
   1. `sudo apt-get update`
   1. `sudo apt-get install git`
   1. `sudo git clone https://github.com/nettings/medianet.git /medianet`
   1. `cd /medianet`
1. Basic setup
   1. Change into `sbin/10-basics-as_user_pi/` and execute the symlinks in
numerical order using ```sudo```, carefully noting any error messages in the
output. Do not run the final one (reboot) just yet.
   1. Drop your own public key into `/home/medianet/.ssh/authorized_keys`,
since the one installed by default is ours and the private key is not part of
this repository.
   1. Reboot
1. Customization
   1. Log into the system as user *medianet* with the appropriate public key.
The host name is now "mn-basic":  
   `ssh -i $PATH_TO_YOURKEY medianet@mn-basic`
   1. Change into `sbin/50-customize-as_user_medianet/` and again execute the
symlinks in numerical order using `sudo`, except for the checkout and build
steps of custom software, those are done with user rights for security reasons.  
   During package installation, you will be asked whether to configure
Icecast2. Answer `no`.  
   Then you will be asked whether to enable realtime privileges for JACK.
Answer `yes`.

   The next steps in this directory will guide you to create a medianet image
file and copy it to a remote machine, which you can use to deploy different
medianet systems. Make sure you have 8G free on the target machine.

Now is a good time to fetch a coffee.

## Deploy the system
Whether you just continue on your first system which you used for the native
bootstrap process, or you cloned several memory cards from the medianet
image created above, you will now have to "individualize" each host to
prevent odd things from happening:

   1. If not already there, log back into the system (still called
`mn-basic`) as user `medianet`.
   1. Change into `/medianet/sbin/80-deploy-as_user_medianet` and execute the
symlinks in numerical order using `sudo`.
   1. If it's been a while, you might throw in an extra  
      ```
      sudo apt update
      sudo apt upgrade
      ```
      before rebooting.
