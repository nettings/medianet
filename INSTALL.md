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

Now switch to the "bullseye64" branch:
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
               https://downloads.raspberrypi.org/raspios_lite_arm64/images/raspios_lite_arm64-2022-04-07/2022-04-04-raspios-bullseye-arm64-lite.img.xz

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

1. Log into the system as user *medianet* with default password *medianet* (this
opens a window of vulnerability and should only be done on a trusted private
network).  
`ssh -A medianet@raspberrypi`
1. Basic setup
   1. Change into `/medianet/sbin/10-run_on_pi/` and execute the symlinks in
numerical order using ```sudo```, carefully noting any error messages in the
output:
```

medianet@raspberrypi:~ $ cd /medianet/sbin/10-run_on_pi
medianet@raspberrypi:/medianet/sbin/10-run_on_pi $ ls -al
total 8
drwxr-xr-x 2 root root 4096 Aug 11 19:53 .
drwxr-xr-x 7 root root 4096 Aug 11 19:53 ..
lrwxrwxrwx 1 root root   17 Aug 11 17:01 10 -> ../mn_mount_local
lrwxrwxrwx 1 root root   22 Aug 11 17:01 15 -> ../mn_generate_locales
lrwxrwxrwx 1 root root   22 Aug 11 17:01 19 -> ../mn_install_packages
lrwxrwxrwx 1 root root   24 Aug 11 17:01 20 -> ../mn_set_owner_medianet
lrwxrwxrwx 1 root root   21 Aug 11 17:01 21 -> ../mn_set_permissions
lrwxrwxrwx 1 root root   20 Aug 11 17:01 25 -> ../mn_deploy_overlay
lrwxrwxrwx 1 root root   28 Aug 11 17:01 27 -> ../mn_install_default_config
lrwxrwxrwx 1 root root   44 Aug 11 17:01 29 -> ../../overlay/usr/local/bin/mn_config_update
lrwxrwxrwx 1 root root   28 Aug 11 17:01 30 -> ../mn_upload_authorized_keys
lrwxrwxrwx 1 root root   16 Aug 11 19:53 35 -> ../mn_setup_sudo
lrwxrwxrwx 1 root root   23 Aug 11 17:01 37 -> ../mn_disable_autologin
lrwxrwxrwx 1 root root   22 Aug 11 19:53 39 -> ../mn_disable_password
lrwxrwxrwx 1 root root   18 Aug 11 17:01 40 -> ../mn_disable_swap
lrwxrwxrwx 1 root root   12 Aug 11 17:01 49 -> ../mn_reboot
medianet@raspberrypi:/medianet/sbin/10-run_on_pi $ sudo ./10
...
``` 
    
> **Note on sudo and SSH keys:**
>
> After executing the sudo setup step, if you are being asked for a sudo
> password, you may have to log out, make sure your SSH agent provides the
> sudo key you configured earlier, and log back in, to be able to access
> sudo again so that you can run the remaining steps. Make sure the sudo key
> you have specified before is available in your SSH key agent.
>
> If you're using PuTTY from Windows, you will need Pageant (the key agent)
> running, and enable "Allow agent forwarding" in your PuTTY configuration.

1. Customization
   1. Log into the system as user *medianet* with the appropriate private
key(s) that belong to the public key(s) you uploaded earlier.
The host name is now "mn-basic". Use agent forwarding (`-A`) to make
sudo work with SSH key authorization:  
   `ssh -A -i $PATH_TO_YOURKEY medianet@mn-basic`
   1. Change into `sbin/50-base_image/` and again execute the
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
   1. Change into `/medianet/sbin/80-deployment` and execute the
symlinks in numerical order using `sudo`.

## Update the system
After running your system for a while, you can update it by going through the
steps in `sbin/110-update`. All steps except the updating of
your local git repository require `sudo`. The scripts will tell you if you get
it wrong.

