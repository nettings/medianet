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

