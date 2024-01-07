# [mn] medianet system roll-out

The `sbin/` directory contains scripts used to convert an almost-vanilla
Raspbian Buster image into a medianet distribution. The process is as follows:

## Automatically create a Raspbian base image
First, check out the [mn] medianet github repository on a Linux machine:
```
git clone https://github.com/nettings/medianet.git
```
Then, switch to the branch that you want to build from:
```
git checkout bookworm
```
> The current stable, recommended branch is `bullseye64`. The 32-bit version
> `bullseye` has not been updated in a while - if you need a 32-bit system,
> check out bullseye64 and specify a RaspiOS 32-bit base image below.

You will find a script `mn_make_image` in `sbin/`.
Since the image creation process is all BASH code, you can check out this repo 
to any modern Linux on any architecture, and it will work (i.e. you don't need
to run this on a Pi even though it's part of the medianet repository).
The script will work without installing anything, but it needs a few shell
include files from the repository, so don't just download the script alone.

Make sure you have at least 16 GB free space in the output directory you are
going to specify below. You need root to make the image, because it involves mounting
it and altering its partition table.
```
you@yourbigbox: $ sudo ./mn_make_image -h

mn_make_image creates a [mn] medianet base image from a RaspiOS release.
Usage: mn_make_image [options...]

--help         displays this message
 -h

--output-path  an output path where the downloaded RaspiOS image and
 -o            the medianet base image will be stored - make sure you have
               enough space for the final image plus an intermediate copy,
               i.e. more than 2x [size] below

--image        a HTTP URL to download or a locally stored image to start
 -i            from; defaults to the latest known-good image, currently
               https://downloads.raspberrypi.com/raspios_lite_arm64/images/raspios_lite_arm64-2023-10-10/2023-10-10-raspios-bookworm-arm64-lite.img.xz

--size         the size of the base image in bytes; needs to be big
 -s            enough to contain the original (unzipped) image plus an extra
               local partition. Making it bigger will give you a bigger root
               fs - the local partition is expanded to the size of the medium
               anyways. Leave alone unless you know what you're doing.
               Default is 7516192768.

--hostname     set initial hostname
 -H            (default is "mn-bootstrap")

--password     set initial password for user "medianet"
 -p            (default is "medianet")

```
Note the default password, which you will need to use during the initial
bootstrapping process (also for `sudo` later on).

> If the script does not work for you, please open an issue and paste the
> complete output, together with information about your distribution.

## Create an SD card
Now the image is ready to be written to a µ-SD card. The capacity of the card
should be at least a couple Gigabytes more than the `size` setting used
before, to leave some room for the writable `/local` partition.
Real men and women use dd:
```
sudo dd if=medianet-base.img of=/dev/$CARDREADER bs=4M status=progress
```
> Be sure you know what you're doing. dd will happily write the image to your
> data drives if you tell it to. You can find out your cardreader device with
> `sudo fdisk -l` or `lsblk`.
> If unsure, there are more user-friendly tools, such as [Balena
> Etcher](https://etcher.balena.io/).

## Bootstrap the system

Now boot a Raspberry Pi with your new image. If all goes well, you will not
need a screen and keyboard attached, all should work headless via SSH.

> Please allow 2-3 minutes for the Pi to boot. The initial startup
> requires the Pi to reboot multiple times. If you're impatient, you can
> ping it and see the reboot breaks.

> As of Bookworm, it seems that the initial automatic reboot fails - if you 
> see your Pi idling without any LED activity on the board and Ethernet socket,
> just unplug and reconnect the power - the system should now come up as
> expected.

1. Log into the system as user *medianet* with the password specified
before.
`ssh -A medianet@raspberrypi`

>The default password is likewise *medianet*, and leaving it like
>this opens a window of vulnerability until it is replaced by a key-based
>login. So you should change it unless you are on a trusted private network
>while bootstrapping.

1. Basic setup
   1. Change into `/medianet/sbin/10-run_on_pi/` and execute the symlinks in
numerical order using ```sudo```, carefully noting any error messages in the
output:
```
medianet@raspberrypi:~ $ cd /medianet/sbin/10-run_on_pi
medianet@mn-basic:/medianet/sbin/10-run_on_pi $ ls -al
total 8
drwxr-xr-x 2 root     root     4096 Nov 25 13:55 .
drwxr-xr-x 7 root     root     4096 Nov 25 13:55 ..
lrwxrwxrwx 1 medianet medianet   17 Nov 25 13:55 10 -> ../mn_mount_local
lrwxrwxrwx 1 medianet medianet   22 Nov 25 13:55 15 -> ../mn_generate_locales
lrwxrwxrwx 1 medianet medianet   22 Nov 25 13:55 19 -> ../mn_install_packages
lrwxrwxrwx 1 medianet medianet   24 Nov 25 13:55 20 -> ../mn_set_owner_medianet
lrwxrwxrwx 1 medianet medianet   21 Nov 25 13:55 21 -> ../mn_set_permissions
lrwxrwxrwx 1 medianet medianet   20 Nov 25 13:55 25 -> ../mn_deploy_overlay
lrwxrwxrwx 1 medianet medianet   28 Nov 25 13:55 27 -> ../mn_install_default_config
lrwxrwxrwx 1 medianet medianet   44 Nov 25 13:55 29 -> ../../overlay/usr/local/bin/mn_config_update
lrwxrwxrwx 1 medianet medianet   28 Nov 25 13:55 30 -> ../mn_upload_authorized_keys
lrwxrwxrwx 1 medianet medianet   16 Nov 25 13:55 35 -> ../mn_setup_sudo
lrwxrwxrwx 1 medianet medianet   23 Nov 25 13:55 37 -> ../mn_disable_autologin
lrwxrwxrwx 1 medianet medianet   22 Nov 25 13:55 39 -> ../mn_disable_password
lrwxrwxrwx 1 medianet medianet   18 Nov 25 13:55 40 -> ../mn_disable_swap
lrwxrwxrwx 1 medianet medianet   12 Nov 25 13:55 49 -> ../mn_reboot
medianet@raspberrypi:/medianet/sbin/10-run_on_pi $ sudo ./10
...
``` 

> It is of course possible to run them all in one go, by doing something like
> `$ for i in [0-9]* ; do sudo $i ; done`
> but you are only doing this once, and you *really* want to see any error
> messages at this point, so being lazy is not recommended when running the
> process for the first time.
    
> **Note on sudo and SSH keys:**
>
> After executing the `mn_setup_sudo` step, if you are being asked for a sudo
> password, you may have to log out, make sure your SSH agent provides the
> sudo key you configured earlier, and log back in, to be able to access
> sudo again so that you can run the remaining steps. Make sure the sudo key
> you have specified before is available in your SSH key agent.
> Alternatively, you can use the default password set earlier.
>
> If you're using PuTTY from Windows, you will need Pageant (the key agent)
> running, and enable "Allow agent forwarding" in your PuTTY configuration.

1. Customization
   1. Log into the system as user *medianet* with the appropriate private
      key(s) that belong to the public key(s) you uploaded earlier.
      The host name is now "mn-basic". Use agent forwarding (`-A`) to make
      sudo work with SSH key authorization:
      `ssh -A -i $PATH_TO_YOURKEY medianet@mn-basic`
   1. Change into `sbin/50-base_image/` and again execute the symlinks in
      numerical order using `sudo`, except for the checkout and build steps
      of custom software, those are done with user rights for security
      reasons.

The next steps in this directory will guide you to create a medianet image
file and copy it to a remote machine, which you can use to deploy different
medianet systems. Make sure you have 8G free on the target machine.

> If you want to learn more about how the medianet overlay works, or you want
> to work on improving it, skip the step to clean backup files. You can then
> see all modifications applied to the base system by the presence of backup
> files or folders ending in `.mn_`, and compare what has been changed.

Now is a good time to fetch a coffee.

> Note that at this point and when first booting a new system from the
> images you just created, there will be tons of errors in the syslog.
> They stem from a missing host key for lighttpd, which will be created in
> the next step.

## Deploy the system
Whether you just continue on your first system which you used for the native
bootstrap process, or you cloned several memory cards from the medianet
image created above, you will now have to "individualize" each host to
prevent odd things from happening:

   1. If not already there, log back into the system (still called
`mn-basic`) as user `medianet`.
   1. Change into `/medianet/sbin/80-deployment` and execute the
symlinks in numerical order using `sudo`.

> As soon as you reboot the system afterwards, there should be no errors
> anymore and all services should deploy without problems. Use `systemctl
> status` to check. If you choose to leave the example configuration
> unchanged, you should hear some Ambient music from Soma FM web radio on
> the headphones output about 45s after booting, assuming your Pi is
> connected to the internet. 
> Now you can customize the [configuration](CONFIGURATION.md) to suit your
> needs.

## Update the system
After running your system for a while, you can update it by going through the
steps in `sbin/110-update`. All steps except the updating of
your local git repository require `sudo`. The scripts will tell you if you get
it wrong.

> Some future changes might require individual configuration steps to be
> re-run. Watch the issue tracker for information.
