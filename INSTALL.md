# [mn] medianet system roll-out

The `sbin/` directory contains scripts used to convert an almost-vanilla
Raspbian Buster image into a medianet distribution. The process is as follows:

## Automatically create a Raspbian base image
First, check out the [mn] medianet github repository on a Linux machine:
```
git clone https://github.com/nettings/medianet.git
```
You will find a script `mn_make_image` in `sbin/`.
Since the image creation process is all BASH code, you can check out this repo 
to any modern Linux on any architecture, and it will work (i.e. you don't need
to run this on a Pi even though it's part of the medianet repository).
The script will work without installing anything, but it needs a few shell
include files from the repository, so don't just download the script alone.
> Important: the default branch ("master") is still on Debian/RaspiOS Buster 
> and will download a slightly out-of-date version. It works well.
>
> If you want to live on the bleeding edge, switch to the "bullseye" branch first:
```
git checkout bullseye
```
Make sure you have at least 14 GB free space in the output directory you are
going to specify below. You need root to make the image, because it involves mounting
it and altering its partition table.
```
you@yourbigbox: $ sudo ./mn_make_image -h
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
If the script does not work for you, please open an issue and paste the complete output,
together with information about your distribution.

## Create an SD card
Now the image is ready to be written to a µ-SD card using the tool of your
choice. Real men and women use dd:
```
sudo dd if=medianet-base.img of=/dev/$CARDREADER bs=4M status=progress
```
> Be sure you know what you're doing. dd will happily write the image to your
> data drives if you tell it to. You can find out your cardreader device with
> `sudo fdisk -l`

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
   1. if you are running bullseye: `git checkout bullseye
1. Basic setup
   1. Change into `sbin/10-basics-as_user_pi/` and execute the symlinks in
numerical order using ```sudo```, carefully noting any error messages in the
output. 
    During package installation, you will be asked whether to configure
Icecast2. Answer `no`.  
   Then you will be asked whether to enable realtime privileges for JACK.
Answer `yes`.Do not run the final one (reboot) just yet.
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

## Update the system
After running your system for a while, you can update it by going through the
steps in `sbin/110-update-as-user-medianet`. All steps except the updating of
your local git repository require `sudo`. The scripts will tell you if you get
it wrong.

