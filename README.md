# [mn] medianet

The medianet distribution is a derivative of Debian Linux/Raspberry Pi OS.
It was created to turn Raspberry Pis into reliable embedded audio nodes,
signal processors, and streaming endpoints.

The audio system is built around the JACK Audio Connection Kit, complemented
with the mod-host to run LV2 plugins, the zita-njbridge to provide clock
decoupled uncompressed network audio streaming, and many other open-source
audio tools.

The system is meant to run headless and unattended. All parts of the audio
signal chain are run as systemd services, and in the unlikely event that one
process crashes, it will be restarted automatically and its connections
re-established.

## Installation

This distribution provides a set of scripts and a file system overlay to turn
a vanilla Raspbian OS Lite image into a medianet system. That means you can
always easily see what has been changed and how, and the system lends itself
well to continuous integration with upstream.

Please see [the installation documentation INSTALL.md](INSTALL.md) in this
directory for details.

## Usage

### User account and access

The default user account is `medianet`. Its password is locked, so you must
drop a suitable ssh key into `~medianet/.ssh/authorized_keys` while you are
bootstrapping the distribution!
All audio-related services run as user medianet.
This user currently has full sudo rights, as it is also the maintenance
account. This will be split in the near future to improve operational
security.

### Configuration and system state

The system configuration is collected in a single file,
`/etc/medianet/config.json`, from which all necessary application config
files are generated whenever it changes, by means of a systemd.path watcher
(using inotify). Ideally, this file comprises the entire state of the
system.

This file is currently very badly documented, and the only hints as to its
syntax are to be found in [the configuration updater script
mn_config_update](overlay/usr/local/bin/mn_config_update). Example
config snippets will be added in due time, and the default configuration
will be extended to showcase more of the available services and features.

### File systems are read-only

In order to make the system robust against cold shutdowns, the `/boot` and
`/` partitions are mounted read-only. All files or folders that must be
written to during operation but needn't be persistent across reboots have
been symlinked into ram disks. For persistent system states and user data,
there is the `/local` partition, which is mounted read-write and
automatically extended to span the remainder of the flash medium.

The goal is that even if `/local` is unclean or even corrupted, the system
will still boot up with ssh and a sufficient system environment to allow for
remote repairs.

For system maintenance, the scripts `mn_make_writable` and
`mn_make_readonly` can be used. The shell prompt will inform you if you are
in a directory that is currently writable. After the next reboot, the system
will again be read-only.

### Web interfaces

By default, you can reach a few web interfaces at `http://localhost:10080`, 
assuming you have forwarded the http port through your ssh connection, like
this:
```
user@your-bigbox:~ $ ssh -L 10080:localhost:80 medianet@your-pi
```
The most immediately useful is an auto-generated simple web GUI to set the
parameters of your DSP plugins.

If you have configured an external jump server for remote maintenance that
your deployed medianet Pi can "phone home to" in `/etc/medianet/mn_tunnel`,
you can start/stop your maintenance tunnel and check its state at
`http://localhost:10080/medianet/Tunnel`.

If you have configured a local Icecast2 server to create a stream from your
JACK signal graph, you will find a corresponding link here as well.

### Features

As of June 2020, the medianet distribution integrates the following
applications ready-to-use:

#### Audio
* the JACK audio connection kit
* gpioctl, a quick and very dirty tool to use buttons and rotary encoders to
affect ALSA mixer settings or generate JACK MIDI, can be multicast to several
medianet nodes
* mod-host by falkTX and the MOD team (to run LV2 plugins for signal processing)
* a large collection of LV2 plugins, among them the latest x42 plugin set by
Robin Gareus and Vladimir Sadovnikov's lsp-plugins automatically built from
source
* Icecast2 and an ffmpeg-based encoder to stream Opus-encoded audio over http
from JACK
* Fons Adriaensen's zita-convolver convolution engine, to apply FIR filters to loudspeakers
* zita-ajbridge (to access a second sound card with an unsynchronized clock)
* zita-njbridge (to stream multichannel uncompressed audio on a local Ethernet
with < 20ms latency either point-to-point or multicast)
* zita-lrx, a Linkwitz-Riley multiband loudspeaker crossover
* Mike Brady's shairport-sync, an Apple AirPlay(tm) receiver

#### Video
* Michal Promonet's v4l2rtspserver to stream the Pi camera and mux in JACK audio with quite low
latency (< .5 s)

#### System tools
* cpufreq to set min and max core frequencies and governor (great to save power)
* lv2rdf2html to generate a simple but useful web UI for all the plugins you
configured to run in mod-host
* a maintenance tunnel with "phone home" capability that will survive
reboots

Other services can be added easily if you don't mind dealing with a JSON parser
written in BASH (but using JQ, so it's not that bad).

## The Good, the Bad, and the Ugly

This system has many very very ugly things going on. Shitloads of BASH scripting,
horrible JSON parsing, and (gasp!) even XSL transformations from RDF/XML to HTML.

The good thing is that all these atrocities only serve to generate shit, that
means as soon as your system is running and actually doing its job, they are out
of the way and cannot affect system stability or efficiency.

The Bad things are listed in the [issue tracker](https://github.com/nettings/medianet/issues).

## Updating your system

The base system is kept up to date with the standard Debian invocation:
```
$ sudo apt update
$ sudo apt upgrade
```
Between major Debian releases, it's also usually safe to run `apt dist-upgrade`.

There is no formalized and systematic way to update the medianet stuff yet.
What you can do is pull from git, although since git cannot deal with file
ownership and groups, you will first have to own everything and then restore the
correct file modes:
```
$ cd /medianet
$ sudo chown -R medianet:medianet
$ git pull
$ sudo sbin/mn_set_permissions
$ sudo sbin/mn_deploy_overlay
```
Depending on what has changed, you might have to do other mysterious things :(
When the custom-built software has been upgraded, you will need to 
```
$ sbin/mn_checkout
$ sbin/mn_build
```
A better-documented updating process is under consideration. Starting with the 
first official release, additional update steps will be documented here.
