# [mn] medianet

The [**mn**] media**net** distribution is a derivative of Debian Linux/RaspiOS.
It was created to turn Raspberry Pis into reliable headless and unattended
media players, signal processors, and streaming endpoints, to be used in art
installations, theatrical performances, and home entertainment.

The audio signal chain is built around the JACK Audio Connection Kit,
complemented with the mod-host to run LV2 plugins, the zita-njbridge to
provide clock decoupled uncompressed network audio streaming, and many other
open-source audio tools.
In addition to the audio focus, there are some video streaming features
based on gstreamer and libcamera.

The system is designed to be controlled over the network via SSH.

All parts of the audio signal chain and other media features are run as
systemd services, and in the unlikely event that one process crashes, it
will be restarted automatically and its JACK connections re-established.

System-critical partitions (`/boot` and `/`) are mounted read-only during
normal operation, so the system will tolerate hard shutdowns well. 

## 64-bit vs. 32-bit

As of RaspiOS *Bookworm*, there is no longer a 32-bit image or branch. If 
you need one, backporting should not be too complicated - actually,
following the steps under [Installation](#installation) below on a 32-bit
image of RaspiOS Bookworm should get you there.

You are welcome to get in touch for help, e.g. by creating an issue, and
please report your progress.

## Installation

The distribution provides a set of scripts and a file system overlay to turn
a vanilla Raspbian OS Lite image into a medianet system. That means you can
always easily see what has been changed and how, and the system lends itself
well to continuous integration with upstream.

Please see the installation documentation [INSTALL.md](/INSTALL.md) in this
directory for details.

## Usage

### User account and access

The default user account is `medianet`.  All media-related services run as
this user. The password is locked, so access is only possible via SSH public
key authentication. You will be asked to install a suitable ssh public key
to `/home/medianet/.ssh/authorized_keys` during the bootstrapping process.

The user has full sudo rights, but they are protected by the
pam_ssh_agent_auth mechanism, i.e. you can only execute sudo commands if the
correct private key is present in your ssh agent. This improves operational
security such that if `medianet` is ever compromised, the attacker does not
immediately have root access.
Again, you are prompted for the respective public key during bootstrapping.

> Note that, if the attacker can run software as the medianet user, it is
> trivial for her to also take over the contents of your SSH agent. So if
> you suspect an intruder, isolate the system or refrain from using agent
> forwarding when logging in.

Depending on your usecase, and if your privilege separation requirements are
not that strict, you can re-use the same key for both purposes.

### Configuration and system state

The system configuration is collected in a single file,
[/etc/medianet/config.json](/overlay/etc/medianet/config.json), from which 
all necessary application config files are generated whenever it changes,
by means of a systemd.path watcher. Outside of hastily introduced new
features, this file comprises the entire state of the system.
This makes deployment, maintenance and replacement of broken devices very
straightforward.

A work-in-progress documentation effort can be found in
[CONFIGURATION.md](/CONFIGURATION.md).

The fearless are advised to look into the updater script
[mn_config_update](/overlay/usr/local/bin/mn_config_update) for more
information.

### File systems are read-only

In order to make the system robust against cold shutdowns, the `/boot` and
`/` partitions are mounted read-only. All files or folders that must be
written to during operation but needn't be persistent across reboots have
been symlinked into ram disks. For persistent system states and user data,
there is the `/local` partition, which is mounted read-write and
can be extended to span the remainder of the flash medium.

The goal is that even if `/local` is unclean or even corrupted, the system
will still boot up with ssh and a sufficient system environment to allow for
remote repairs.

For system maintenance, the scripts [mn_make_writable](/overlay/usr/local/bin/mn_make_writable)
and [mn_make_readonly](/overlay/usr/local/bin/mn_make_readonly) can be used.
The shell prompt will inform you if you are in a directory that is currently
writable. After the next reboot, the system will again be read-only.

### Web interfaces

The medianet distribution comes with a few web interfaces to help control some
aspects of the system. By default, they are firewalled off, so you will have
to forward them through your SSH connection as follows:
```
user@your-bigbox:~ $ ssh -L 10080:localhost:80 medianet@your-pi
```

Alternatively, you can open the web port(s) to the outside world, but you
should only do this on a trusted private network, as there is no
authentication at all:
```
medianet@yourpi:~ sudo ufw allow https
```

The most immediately useful is an auto-generated simple web GUI to set the
parameters of your DSP plugins.

If you have configured an external jump server for remote maintenance that
your deployed medianet Pi can "phone home to" in 
[/etc/medianet/mn_tunnel.conf](/overlay/etc/medianet/mn_tunnel.conf),
you can start/stop your maintenance tunnel and check its state at
`http://localhost:10080/medianet/Tunnel`.

If you have configured a local Icecast2 server to create a stream from your
JACK signal graph, you will find a corresponding link here as well (which
will require port 8000 to be forwarded as well). 

> Port 8000 is open to the outside by default so that people can access the 
> stream.

### Features

As of February 2024, the medianet distribution integrates the following
applications ready-to-use:

#### Audio
* the JACK audio connection kit
* gpioctl, a quick and very dirty tool to use buttons and rotary encoders to
  affect ALSA mixer settings or generate JACK MIDI, can be multicast to several
  medianet nodes
* mod-host by falkTX and the MOD team (to run LV2 plugins for signal processing)
* a large collection of LV2 plugins, among them the latest x42 plugin set by
  Robin Gareus and Vladimir Sadovnikov's lsp-plugins, all automatically built from
  source
* Mike Brady's shairport-sync, an Apple AirPlay(tm) and AirPlay2(tm) receiver
* Icecast2 and an ffmpeg-based encoder to stream Opus-encoded audio over http
  from JACK
* zita-ajbridge (to access a second sound card with an unsynchronized clock)
* zita-njbridge (to stream multichannel uncompressed audio on a local Ethernet
  with < 20ms latency either point-to-point or multicast)
* Fons Adriaensen's zita-convolver convolution engine, useful to apply FIR
  filters to loudspeakers
#### Video
* mn_hdmi-[tx|rx], GStreamer-based HDMI-over-IP extender
* the KODI media center

#### Other tools
* cpupower to set min and max core frequencies and governor (great to save power)
* lv2rdf2html to generate a simple but useful web UI for all the lv2 plugins you
  configured to run in mod-host
* a persistent SSH-based maintenance tunnel with "phone home" capability
  that can help you traverse multiple layers of NAT (network address translation,
  aka home routers), very useful for museum deployments and the like
* somewhat hacky `mn_autostart@` and mn_autostart_root@` services that basically
  allows you to run arbitrary bash commands at startup and have systemd look after
  them for you (see the example configuration for a use case)

Other services can be added easily if you don't mind dealing with a JSON parser
written in BASH (but using JQ, so it's not that bad).

## The Good, the Bad, and the Ugly

This system has many very very ugly things going on. Shitloads of BASH
scripting, horrible JSON parsing, and (gasp!) even XSL transformations from
RDF/XML to HTML.

The good thing is that all these atrocities only serve to generate stuff. 
That means as soon as your system is running and actually doing its job, the
shell scripts are are out of the way and cannot affect system reliability or
efficiency.

The Bad things are listed in the [issue tracker](https://github.com/nettings/medianet/issues).

In general, the philosophy is to modify a standard base distribution in a
reproducible, discoverable way for reliable headless unattended low latency
media operation. 

Each installation step is a separate script that can be read as a HOWTO for
accomplishing a particular task. All changes to the base system are made via
sybolic links into the `/medianet/overlay` tree, so you can always see at a 
glance which aspects of the underlying RaspiOS have been tweaked, and how.
This will help you customize or improve the system for your own needs.

## Updating your system

It is generally safe to apply all minor Debian/RaspiOS rolling upgrades
within the same release at any time (`sudo apt update ; sudo apt upgrade`).
Updating the medianet part is still work in progress. Unless there have been 
major changes, applying the steps in [sbin/110-update](/sbin/110-update)
should get you most of the way. More fundamental changes will necessitate
other configuration steps which will be documented separately in
[sbin/110-update/README.md](sbin/110-update/README.md).

Doing a full distribution upgrade from one RaspiOS major release to the next
is not officially supported by the RaspiOS team.
For a dedicated system like this with minimal configuration and customization,
it is always advisable to just back up your personal `config.json` and roll a
new image from scratch rather than updating in place. 

For each major RaspiOS release, a new branch of the `medianet` overlay
will be created.

## File system structure

* [custom_builds/](/custom_builds) contains checkout and build instructions for
  third-party packages that are being built from source, because they are either
  unavailable or too old in Debian upstream
* [lib/](/lib) contains BASH script includes and system-wide constants that
  are used in all medianet-related tools. You might be interested in tweaking
  some of them.
* [overlay/](/overlay) mimics the system directory structure. Its contents
  will be symlinked into the running base system. This is the runtime stuff
  that makes up the medianet distribution.
* [sbin/](/sbin) contains scripts that are only used during initial system
  bootstrapping, maintenance, or upgrade.
