# [mn] medianet configuration

The entire state of a medianet node is collected in
`/etc/medianet/config.json`. This file is being watched for changes by 
mn_config.path (a [systemd path
unit](https://www.freedesktop.org/software/systemd/man/systemd.path.html)).
When a change in that file is detected, the `mn_config_update` command is
triggered to automatically generate all necessary configuration files for
the features provided by the medianet distribution overlay.

You can provision or re-provision a running medianet node by dropping a new
config file in the proper place, waiting for the `mn_config_update`
background task to complete its job (you can watch its progress with `sudo
journalctl -f`), and rebooting.

In its current state, the config.json mechanism is a very thin layer of glue
on top of systemd unit files to collect the configurations of multiple 
audio tools in a single place. It exposes the wildly different configuration
mechanisms for all these tools. In the future, alternative services may be
offered which hardcode most of the configuration and offer a more systematic
and inituitive interface to config.json.

## config.json syntax

The config file is a serialized JSON object, which makes it accessible to
automated deployment tools. It does however have a few differences compared
to other common configuration file formats:
* You cannot use comments.
* You cannot use tab or other meta characters inside string literals (the
  JSON structure itself may well be formatted with tabs for better
  readability). Unfortunately, this precludes the use of multiline strings,
  which would sometimes improve readability.
* All keys are case sensitive.

### Top level structure

The outer framework of top-level elements is as follows:
```
{
```
A short string describing what this particular setup does, 
ideally a token without whitespaces and special chars, 
shown on the login screen and available to scripts that include
`/etc/medianet/config.inc` as `${CONFIG_PRODUCT}`:
```
	"product"     : "base_model",
```
A longer description of what this setup does, also shown on
the login screen and available as `{CONFIG_DESCRIPTION}`: 
```
	"description" : "Example audio source with simple DSP chain, shairport-sync sink, zita-njbridge source and Icecast2 stream server",
```
This will be the actual hostname of this machine, so 
`[a-z][a-z0-9-]*` only and should not start with a number. It is
available as `${CONFIG_HOSTNME}` (or via the ubiquitous env
variable $HOSTNAME):
```
	"hostname"    : "mn-basic",
```
An arbitrarily chosen string that helps you remember the 
physical whereabouts of this machine. Available as
`${CONFIG_LOCATION}`:
```
	"location"    : "Mad Scientist Lab", 
```
An arbitrarily chosen string that helps you keep track of
configuration changes in longer-term deployments. Available
as `${CONFIG_VERSION}`:
```
	"version"     : "2022-01-17", 
```
The following keys control the low-level configuration of
your Raspberry Pi as described in [/boot/config.txt](https://www.raspberrypi.com/documentation/computers/config_txt.html):
```
	"bootConfig": {
```
dtparam and dtoverlay statements can occur multiple times, so they
are handled as arrays of strings:
```
		"dtparam"   : [
			"audio=off"
		],
		"dtoverlay" : [
			"disable-wifi",
			"disable-bt"
		],
```
All other settings only occur a single time, so they are
handled as simple key/value pairs:
```
		"gpu_mem"  : 128
	},
```
> You can use any command that is allowed in the [Raspberry Pi config.txt
> file](https://www.raspberrypi.com/documentation/computers/config_txt.html)
> as a key/value pair in the `bootConfig` section.
>
> Caution: there is an implicit and not very well documented order to
> dtoverlay/dtparam commands, and the config.json parser may get this
> context-sensitivity wrong at times (see [issue
> #108](https://github.com/nettings/medianet/issues/108)).

All features of a medianet system are systemd services. They are
configured as follows:
```
	"systemdUnits": [
		{
			"unit"      : "mn_foo",
```
> Some services also exist as `systemd templates`, which means they can be
> instatiated multiple times, for example as `mn_mpv@player_1`. Check
> `/medianet/overlay/usr/local/lib/system/system/` for services ending in
> `@`.

This is redundant, because we do not currently handle
unit types other than `service` in config.json, and the
option might go away in the future:
```
			"type"      : "service",
```
A 0/1 value to allow configured units to be turned off
easily. Any unit that is not explicitly enabled in
config.json is assumed off (i.e. deleting a unit object
here will disable it):
```
			"enabled"   : 1,
```		
JACK clients will honour the following option if the
underlying program supports setting the client name. If
it doesn't (such as with jackd itself, which always names
itself `system`), it must be set to the actual value the
jack client uses, so that connection management works
correctly:
```
			"jackName"  : "foo"
```
The *options* mechanism is used for programs that can be
completely configured via the command line:
This is either the full set of command line options to the
underlying program, or a partial set with some settings 
hardcoded into the corresponding service file. Check
`/medianet/overlay/usr/lib/systemd/system/mn_*.service`
for details.
```
			"options"  : "-k -zMagic --anticipate_user_needs"
```
For programs that read their configuration from a
configuration file, the *config* mechanism is used. It
consists of a simple array of strings, which will be
written out into the corresponding config file by
mn_config_update, which knows the name and location of
said file:
```
			"config"   : [
				"first line of config statements",
				"second line of config statements"
			],
```
JACK clients can optionally define `inPorts` and `outPorts`.
The ports thus defined are handled by the automatic
connection management. You cannot change the names via
this mechanism, port names have to match what the client
is actually providing. inPorts and outPorts are arrays of
objects. When the client name matches the `jackName`, you
only need to list the relative port names after the colon
(see jack_lsp). If they don't, as is the case with
mod-host for example, you will have to provide a fully
qualified port name:
```
			"inPorts"  : [
				{
					"portName"  : "left_input"
				},
				{
					"portName"  : "right_input"
				}
			],
```
outPorts can optionally specifiy the `targetUnit` and `targetPort`
index (of that unit's list of inPorts) they want to be
connected to. The port index starts with 0. I regret that
choice now, but we're stuck with it for the time being:
```
			"outPorts" : [
				{
					"portName"  : "left_output"
					"targetUnit": "mn_jackd"
					"targetPort": 0
				},
				{
					"portName"  : "right_output"
					"targetUnit": "mn_jackd"
					"targetPort : 1
				}
			]
		}
	]
}
```

### JACK connection management
The automatic configuration updater (or a manual call to `mn_config_update`) 
will read the JACK connection graph fron the `config.json` file and write each
service's incoming and outgoing connections to
`/etc/systemd/system/foo.service.d/foo.service.connections`.

Each service performs
```
ExecStartPost=-/usr/local/bin/mn_connect foo.service --timeout 30 --interval 5
```
as part of its post-startup routine, which will attempt to connect all ports
as quickly as possible, and keep retrying to connect failed ports (e.g. to
clients who might still be starting up) every 5 seconds for a total of 30
seconds. The call is prepended with a `-` (minus) sign, which means the
service will not fail even if some connection could not be made.

> This behaviour has changed - previously, a failed JACK client could cause
> connection timeouts in others and force them to restart.
> The idea behind the new behaviour is to leave core services (such as
> `mn_mod-host`) running unhindered, even if a peripheral service (a frequent
> culprit was `mn_listen` due to an icecast2 issue) has failed.

## Configuration examples

### JACK using the RPi 4b's built-in PWM minijack output

> This is part of the default configuration. Unfortunately, the Pi5 does not
> have a built-in mini jack output anymore, so it will break for Pi5 users.

```
{
	"unit"    : "mn_jackd",
	"type"    : "service",
	"enabled" : 1,
	"jackName": "system",
	"options" : "-R -P40 -d alsa -d hw:Headphones -P -S -p 1024 -n 2 -r 48000 -i 0 -o 2",
	"inPorts": [
		{
			"portName"   : "playback_1"
		},
		{
			"portName"   : "playback_2"
		}
	],
	"outPorts": [
	]
}
```

This set of command line options makes jackd run with realtime permissions
(`-R`) at a realtime priority `-P` of 40, i.e. below that of the kernel's
tasklet handlers, so it cannot starve the audio device. In some
circumstances, e.g. under heavy network load when running alongside an MJPEG
stream receiver, it may be necessary to raise this above the tasklet
priority.

We use the ALSA backend and the hardware device "Headphones" without any
software adaptor layer (`hw:`). This is highly efficient, but it means that
the jackd settings must match the hardware capabilities exactly.
Since the PWM device provides only an output, we select playback-only mode
(`-P`). The device expects 16 bit integers, so we set the `-S` (shorts)
option.

The PWM device is a little bit tricky with respect to timing - a generally
stable setting is a period size of 1024 frames (`-p`) and two periods per
buffer (`-n`). At this setting, it has no trouble coping with a samle rate
of 48000 Hz (`-r`).

Due to a minor bug in jackd, the audio device will only open successfully if
we additionally specify zero input channels and two output channels (`-i`
and `-o`), although this should be implied by `-P` already.

### JACK using the HDMI output
This setup will enable 7.1 surround playback via the HDMI port to a sufficiently
equipped A/V home cinema amplifier or a HDMI audio extractor.

It has been tested on a Raspberry Pi 4B running KODI. It should also run on other
Pi boards, and shorter period sizes (at least down to 512) should be possible.

> For 5.1 or stereo-only playback, you could limit the number of output channels
> to 6 (`-o 6`) or 2, and and use fewer `inPorts`, but the savings in CPU load are
> usually negligible.

For a complete surround setup using KODI, see the [KODI](#kodi) example below.
```
{
	"unit"    : "mn_jackd",
	"type"    : "service",
	"enabled" : 1,
	"jackName": "system",
	"options" : "-R -P40 -d alsa -d hdmi:vc4hdmi0 -P -S -p 1024 -n 2 -r 48000 -i 0 -o 8"
	"inPorts": [
		{
			"portName"   : "playback_1"
		},
		{
			"portName"   : "playback_2"
		},
		{
			"portName"   : "playback_3"
		},
		{
			"portName"   : "playback_4"
		},
		{
			"portName"   : "playback_5"
		},
		{
			"portName"   : "playback_6"
		},
		{
			"portName"   : "playback_7"
		},
		{
			"portName"   : "playback_8"
		}
	],
	"outPorts": [
	]
}
```
This setting will only work if an audio-capable HDMI sink is connected to the Pi.
Ways to force-hotplug the hardware to always provide this device and to
enable up to 8 channel playback for surround sound applications are
currently under investigation.

> For an alternative approach, check out the [KODI section](#kodi), which uses
> `zita-j2a` for the job and has performed reliably in a few installations.

### JACK using Hifiberry products

#### HifiBerry DAC+ADC
To enable the driver for this card, add
```
bootConfig : [
	dtoverlay : [
		"hifiberry-dacplusadc"
	]
]
```

```
{
	"unit"    : "mn_jackd",
	"type"    : "service",
	"enabled" : 1,
	"jackName": "system",
	"options" : "-R -t 4500 -P 40 -dalsa -dhw:sndrpihifiberry -D -r48000 -p512 -n2 -zs",
	"inPorts": [
		{
			"portName"   : "playback_1"
		},
		{
			"portName"   : "playback_2"
		}
	],
	"outPorts": [
		{
			"portName"   : "capture_1",
			"targetUnit" : "mn_mod-host",
			"targetPort" : 0
		},
		{
			"portName"   : "capture_2",
			"targetUnit" : "mn_mod-host",
			"targetPort" : 1
		}
	]
}
```
If you need lower latency, it is possible to run Hifiberry cards at `-p 128`
without any problems.

#### Other Hifiberry products
The JACK settings generally remain the same. Just add the correct overlay as
per the Hifiberry documentation, and for devices without inputs, use `-P` 
("playback only") instead of `-D` ("duplex") in JACK options, and leave the
`inPorts` array empty.

### mod-host

mod-host provides an easy way to run a DSP chain of LV2 plugins on the Pi.
Its setup is slightly tricky because each plugin running in mod-host
presents as a separate JACK client called `effect_N`, where N is an index set
during plugin instantiation.

Not all mod-host client ports need to be declared as inPorts or outPorts -
it is usually more convenient to only declare the entrance and exit ports,
and treat inter-plugin connections as "private" to mod-host.
This example puts a 12x10 matrix mixer at the beginning of the plugin chain,
so that multiple sources can be mixed together at different levels. The
actual DSP chain consists of a parametric equalizer, a simple speaker
management plugin for delay and gain compensation, and a limiter to prevent
overloading of the analog output stage.

Only a few of the matrix inputs and the two limiter outputs  are declared as
external ports (and will be handled by the connection management system),
the others are private to mod-host and are handled by `connect` statements
in the `config` section.

The config section also contains some default settings of plugin parameters.
If parameters are changed at runtime, the `mn_modsave`/`mn_modconf`
mechanism will ensure their persistence.

The medianet distribution comes with a simple web GUI to control the
settings of plugins running in mod-host. It is accessible via
http://$HOSTNAME/medianet/DSP and provided by the lv2rdf2html package. 

> The GUI is machine-generated, but not dynamically: after changing the
> plugin configuration of mn_mod-host, you will have to re-run
> `$~> /medianet/sbin/mn_build lv2rdf2html`
> The generated plugin GUI will automatically be deployed to the web server
> docroot.

```
{
	"unit"    : "mn_mod-host",
	"type"    : "service",
	"enabled" : 1,
	"jackName": "mod-host",
	"options" : "",
	"inPorts" : [
		{
			"portName"   : "effect_0:in1"
		},
		{
			"portName"   : "effect_0:in2"
		},
		{
			"portName"   : "effect_0:in3"
		},
		{
			"portName"   : "effect_0:in4"
		},
		{
			"portName"   : "effect_0:in5"
		},
		{
			"portName"   : "effect_0:in6"
		}
	],
	"outPorts": [
		{
			"portName"   : "effect_9:outL",
			"targetUnit"     : "mn_jackd",
			"targetPort" : 0
		},{
			"portName"   : "effect_9:outR",
			"targetUnit"     : "mn_jackd",
			"targetPort" : 1
		}
	],
	"config": [
		"add http://gareus.org/oss/lv2/matrixmixer#i12o10 0",
		"add http://gareus.org/oss/lv2/fil4#stereo 1",
		"add http://stackingdwarves.net/lv2/sm#stereo 4",
		"add http://gareus.org/oss/lv2/dpl#stereo 9",
		"connect effect_0:out1 effect_1:inL",
		"connect effect_0:out2 effect_1:inR",
		"connect effect_1:outL effect_4:inL",
		"connect effect_1:outR effect_4:inR",
		"connect effect_4:outL effect_9:inL",
		"connect effect_4:outR effect_9:inR",
		"param_set 0 mix_1_1 1",
		"param_set 0 mix_1_3 1",
		"param_set 0 mix_2_2 1",
		"param_set 0 mix_2_4 1",
		"param_set 0 mix_3_1 1",
		"param_set 0 mix_3_3 1",
		"param_set 0 mix 4_2 1",
		"param_set 0 mix_4_4 1",
		"param_set 0 mix_5_1 1",
		"param_set 0 mix_5_3 1",
		"param_set 0 mix_5_5 0",
		"param_set 0 mix_6_2 1",
		"param_set 0 mix_6_4 1",
		"param_set 0 mix_6_6 0",
		"param_set 0 mix_7_7 0",
		"param_set 0 mix_8_8 0",
		"param_set 0 mix_9_9 0",
		"param_set 0 mix_10_10 0",
		"param_set 9 gain -2",
		"param_set 9 threshold -2"
	]
}
```

### Streaming audio to other [mn] medianet hosts
The zita-njbridge package will enable you to stream very low-latency,
uncompressed audio between hosts running JACK with unsynchronised sample
clocks, using very-high-quality dynamic resampling.

> It is usually not a good idea to run the JACK graph on the built-in PWM
> device - its timing stability is not very good and will lead to
> unsatisfactory zita-njbridge performance, as it will have to compensate
> for both the deviations at the remote *and* the local end. Use a physical
> sound card if at all possible.

#### source configuration
This snippet will send audio from the local JACK graph onto an
administratively-scoped IPv4 multicast group, where it can be picked up by
an arbitrary number of receivers on the local network.

> Be careful: dumb switches that do not support IGMP snooping will just
> duplicate multicast traffic to all ports, no matter whether the client
> behind that ports wants it or not. Using more than a few multicast streams
> under such conditions will quickly degrate network performance.

If your network addresses are stable and known in advance, *and* you only 
want to send audio to one receiver, it's better to use a normal unicast IPv4
address.

Stick to port 30000 - `mn_config_update` will automatically open that port in
the firewall when it detects an active zita-njbridge service.

> For latency and debugging hints, consult the `zita-njbridge` man page.

```
{
	"unit"    : "mn_zita-j2n",
	"type"    : "service",
	"enabled" : 1,
	"jackName": "zita-j2n",
	"options" : "--chan 2 239.192.17.65 30000 medianet0",
	"inPorts": [
		{
			"portName" : "in_1"
		},
		{
			"portName" : "in_2"
		}
	]
}
```

#### sink configuration
This snippet will receive audio from an administratively-scoped IPv4
multicast group and make it available to the local JACK graph. Because the
zita-n2j client has to perform dynamic resampling, its CPU load is
non-negligible.
An additional buffer setting of 20 ms is conservative and may be reduced to
10 or even 0 on a dedicated network without other traffic.

If you stick to the default port of 30000, mn_config_update will
automatically punch a hole in the firewall for you.
```
{
	"unit"    : "mn_zita-n2j",
	"type"    : "service",
	"enabled" : 0,
	"jackName": "zita-n2j",
	"options" : "--chan 1,2 --buff 20 239.0.0.1 30000 medianet0",
	"inPorts" : [],
	"outPorts": [
		{
			"portName"   : "out_1",
			"targetUnit" : "mn_mod-host",
			"targetPort" : 0
		},
		{
			"portName"   : "out_2",
			"targetUnit" : "mn_mod-host",
			"targetPort" : 1
		}
	]
}
```

### Providing an AirPlay/AirPlay2 sink with shairport-sync
Thanks to Mike Brady and his helpful attitude towards accepting a JACK
backend to shairport-sync, AirPlay and Airplay2 audio can now be fully
integrated into a medianet audio system. 

You do not need an Apple device to use this audio source - a number of
free Android apps are available to stream AirPlay, and it is also
supported by PulseAudio with its RAOP sink and source.
```
{
	"unit"    : "mn_shairport-sync",
	"type"    : "service",
	"enabled" : 1,
	"jackName": "shairport-sync",
	"inPorts" : [],
	"outPorts": [
		{
			"portName"   : "out_L",
			"targetUnit" : "mn_mod-host",
			"targetPort" : 0
		},
		{
			"portName"   : "out_R",
			"targetUnit" : "mn_mod-host",
			"targetPort" : 1
		}
	],
	"config"  : [
		"general = {",
		"  name = \"[mn] %h\";",
		"  interpolation = \"soxr\";",
		"  output_backend = \"jack\";",
		"  drift_tolerance_in_seconds = 0.015;",
		"  ignore_volume_control = \"no\";",
		"  interface = \"medianet0\";",
		"}",
		"jack = {",
		"  soxr_resample_quality = \"very high\"",
		"}",
		"sessioncontrol = {",
		"//  run_this_before_play_begins = \"/usr/local/bin/mn_disconnect zita-n2j.service\";",
		"//  run_this_after_play_ends = \"/usr/local/bin/mn_connect zita-n2j.service\";",
		"}",
		"diagnostics = {",
		"  statistics = \"no\";",
		"}"
	]
}
```   

### HDMI over IP
With two Raspberry Pi 4B and a cheap HDMI USB2 grabber, it is possible
to create a low-cost HDMI over IP extender with reasonable, although not
perfect, quality. Video is grabbed by a `gstreamer` chain and forwarded
as quickly as possible, and received without buffer or resynchronisation
by another gstreamer chain on the sink.
The audio is transmitted independently via `zita-njbridge` and resampled
to the sink's JACK clock.

> Again, you can opt for multicasting, which is easy to configure and will
> allow multiple sinks without extra costs, but it will rapidly congest
> your network if you have switches that do not do IGMP snooping.
> Alternatively, you can insert a (fixed) IPv4 address.

> mn_hdmi-[tx|rx] will also accept a local hostname (which will be looked
> up and replaced by an IP address before calling gstreamer). This needs to
> be implemented for zita-njbridge as well.

#### source configuration
```
{
	"unit"    : "mn_hdmi-tx",
        "type"    : "service",
        "enabled" : 1,
        "options" : "/dev/video0 239.192.17.43 29999"
},
{
        "unit"    : "mn_zita-j2n@hdmi",
        "type"    : "service",
        "enabled" : 1,
        "jackName": "hdmi_sender",
        "options" : "--chan 2 239.192.17.44 30000 medianet0",
        "inPorts": [
                {
                        "portName" : "in_1"
                },
                {
                        "portName" : "in_2"
                }
        ]
}
```

#### sink configuration
```
{
        "unit"    : "mn_hdmi-rx",
        "type"    : "service",
        "enabled" : 1,
        "options" : "239.192.17.43 29999"
},
{
        "unit"    : "mn_zita-n2j@hdmi",
        "type"    : "service",
         "enabled" : 1,
        "jackName": "zita-n2j",
        "options" : "--chan 1,2 --buff 30 239.192.17.44 30000 me
        "inPorts" : [],
        "outPorts": [
                {
                        "portName"   : "out_1",
                        "targetUnit" : "mn_mod-host",
                        "targetPort" : 4
                },
                {
                        "portName"   : "out_2",
                        "targetUnit" : "mn_mod-host",
                        "targetPort" : 5
                }
        ]
}
```   

### Clearing local console 
If you are using the HDMI output for media display, you may want to prevent
your audience from seeing system messages or the Linux command prompt:
```
{
	"unit"    : "mn_autostart_root@clear_console",
	"type"    : "service",
	"enabled" : 1,
	"options" : "/usr/local/bin/mn_console --blank"
}
```
To see the console again, issue `sudo mn_console --unblank`. You might also
have to hit a key locally and/or kill the agetty process to get back to the
initial view.

### KODI

This snippet will help you integrate KODI into your medianet setup. It is
assumed that you have a 5.1 amplifier that is connected via HDMI, or (in my
case), an HDMI audio extractor connected to an active 5.1 speaker set.
The JACK server can run in dummy mode or on any other sound device, such as
the built-in mini-jack via the PWM device. `zita-j2a` will resample your
audio to play nicely over the HDMI output.

The channel order is L, R, C, Sub, SL, SR. We add a stereo EQ plugin each for
L/R and SL/SR, and a mono EQ for center and sub. Loudspeaker management
plugins are used to delay the surround speakers by 10 ms so that they don't
hit before the screen ones, and the center is delayed by 0.6 ms because in my
setup it sits slightly in front of the screen.

> The settings below will add about 10 ms of latency, around a quarter frame
> for cinema content and well below tolerance thresholds. If it bothers you, 
> you can adjust it via the settings icon in the KODI player. Remember to
> make it the default for all media. 
```
{
	"unit"    : "mn_jackd", 
	"type"    : "service",
	"enabled" : 1,
	"jackName": "system",
	"options" : "-R -P40 -d alsa -d hdmi:vc4hdmi0 -P -S -p 1024 -n 2 -r 48000 -i 0 -o 8",
	"inPorts": [
		{
			"portName"   : "playback_1"
		},
		{
			"portName"   : "playback_2"
		},
		{
			"portName"   : "playback_3"
		},
		{
			"portName"   : "playback_4"
		},
		{
			"portName"   : "playback_5"
		},
		{
			"portName"   : "playback_6"
		},
		{
			"portName"   : "playback_7"
		},
		{
			"portName"   : "playback_8"
		}
	],
	"outPorts": [
	]
},
{
	"unit"    : "mn_kodi",
	"type"    : "service",
	"enabled" : 1
},
{
	"unit"    : "mn_mod-host",
	"type"    : "service",
	"enabled" : 1,
	"jackName": "mod-host",
	"options" : "",
	"inPorts" : [
		{
			"portName"   : "effect_0:in1"
		},
		{
			"portName"   : "effect_0:in2"
		},
		{
			"portName"   : "effect_0:in3"
		},
		{
			"portName"   : "effect_0:in4"
		},
		{
			"portName"   : "effect_0:in5"
		},
		{
			"portName"   : "effect_0:in6"
		},
		{
			"portName"   : "effect_0:in7"
		},
		{
			"portName"   : "effect_0:in8"
		},
		{
			"portName"   : "effect_0:in9"
		},
		{
			"portName"   : "effect_0:in10"
		},
		{
			"portName"   : "effect_0:in11"
		},
		{
			"portName"   : "effect_0:in12"
		}
	],
	"outPorts": [
		{
			"portName"   : "effect_19:outL",
			"targetUnit" : "mn_jackd",
			"targetPort" : 0
		},{
			"portName"   : "effect_19:outR",
			"targetUnit" : "mn_jackd",
			"targetPort" : 1
		},{
			"portName"   : "effect_39:out",
			"targetUnit" : "mn_jackd",
			"targetPort" : 3
		},{
			"portName"   : "effect_49:out",
			"targetUnit" : "mn_jackd",
			"targetPort" : 2
		},{
			"portName"   : "effect_59:outL",
			"targetUnit" : "mn_jackd",
			"targetPort" : 4
		},{
			"portName"   : "effect_59:outR",
			"targetUnit" : "mn_jackd",
			"targetPort" : 5
		},{
			"portName"   : "effect_0:out9",
			"targetUnit" : "mn_listen",
			"targetPort" : 0
		},{
			"portName"   : "effect_0:out10",
			"targetUnit" : "mn_listen",
			"targetPort" : 1
		}
	],
	"config": [
		"add http://gareus.org/oss/lv2/matrixmixer#i12o10 0",
		"add http://gareus.org/oss/lv2/fil4#stereo 11",
		"add http://stackingdwarves.net/lv2/sm#stereo 14",
		"add http://gareus.org/oss/lv2/dpl#stereo 19",
		"add http://gareus.org/oss/lv2/fil4#mono 31",
		"add http://stackingdwarves.net/lv2/sm#stereo 34",
		"add http://gareus.org/oss/lv2/dpl#mono 39",
		"add http://gareus.org/oss/lv2/fil4#mono 41",
		"add http://gareus.org/oss/lv2/dpl#mono 49",
		"add http://gareus.org/oss/lv2/fil4#stereo 51",
		"add http://stackingdwarves.net/lv2/sm#stereo 54",
		"add http://gareus.org/oss/lv2/dpl#stereo 59",
		"connect effect_0:out1 effect_11:inL",
		"connect effect_0:out2 effect_11:inR",
		"connect effect_11:outL effect_14:inL",
		"connect effect_11:outR effect_14:inR",
		"connect effect_14:outL effect_19:inL",
		"connect effect_14:outR effect_19:inR",
		"connect effect_0:out3 effect_31:in",
		"connect effect_0:out4 effect_41:in",
		"connect effect_31:out effect_34:inL",
		"connect effect_41:out effect_34:inR",
		"connect effect_34:outL effect_39:in",
		"connect effect_34:outR effect_49:in",
		"connect effect_0:out5 effect_51:inL",
		"connect effect_0:out6 effect_51:inR",
		"connect effect_51:outL effect_54:inL",
		"connect effect_51:outR effect_54:inR",
		"connect effect_54:outL effect_59:inL",
		"connect effect_54:outR effect_59:inR",
		"param_set 0 mix_1_1 1",
		"param_set 0 mix_2_2 1",
		"param_set 0 mix_3_3 1",
		"param_set 0 mix_4_4 1",
		"param_set 0 mix_5_5 1",
		"param_set 0 mix_6_6 1",
		"param_set 0 mix_7_7 0",
		"param_set 0 mix_8_8 0",
		"param_set 0 mix_9_9 0",
		"param_set 0 mix_10_10 0",
		"param_set 14 gain -20.0000",
		"param_set 34 gain -10.0000",
		"param_set 34 attL -10.0000",
		"param_set 34 delayL 0.6000",
		"param_set 34 attR -6.0000",
		"param_set 34 delayR 0.6000",
		"param_set 54 gain -20.0000",
		"param_set 54 delayL 10.0000",
		"param_set 54 delayR 10.0000",
		"param_set 79 gain -2",
		"param_set 79 threshold -2",
		"param_set 99 gain -2",
		"param_set 99 threshold -2",
		"param_set 109 gain -2",
		"param_set 109 threshold -2",
		"param_set 119 gain -2",
		"param_set 119 threshold -2"
	]
},
{
	"unit"    : "mn_shairport-sync",
	"type"    : "service",
	"enabled" : 1,
	"jackName": "shairport-sync",
	"inPorts" : [],
	"outPorts": [
		{
			"portName"   : "out_L",
			"targetUnit" : "mn_mod-host",
			"targetPort" : 8
		},
		{
			"portName"   : "out_R",
			"targetUnit" : "mn_mod-host",
			"targetPort" : 9
		}
	],
	"config"  : [
		"general = {",
		"  name = \"[mn] %h\";",
		"  interpolation = \"soxr\";",
		"  output_backend = \"jack\";",
		"  drift_tolerance_in_seconds = 0.015;",
		"  ignore_volume_control = \"no\";",
		"  volume_control_profile = \"dasl_tapered\";",
		"  interface = \"medianet0\";",
		"}",
		"jack = {",
			"  soxr_resample_quality = \"very high\"",
		"}",
		"sessioncontrol = {",
		"//  run_this_before_play_begins = \"/usr/local/bin/mn_disconnect zita-n2j.service\";",
		"//  run_this_after_play_ends = \"/usr/local/bin/mn_connect zita-n2j.service\";",
		"}",
		"diagnostics = {",
		"  statistics = \"no\";",
		"  log_verbosity = 0",
		"}"
	]
}
```

Since KODI does not support JACK natively, the signal flow is a bit
convoluted:

* The `mn_kodi.service` file will force ALSA output by setting
  `KODI_AE_SINK=ALSA`.
* In the KODI system settings under *AUDIO*, you have to choose the `KODI to
JACK 5.1 sink`.
* In `/home/medianet/, an `.asoundrc` file provides the matching endpoints:
```
pcm.jack_kodi {
        type jack
        playback_ports {
                0 effect_0:in1
                1 effect_0:in2
                2 effect_0:in5
                3 effect_0:in6
                4 effect_0:in3
                5 effect_0:in4
        }
        capture_ports {
        }
        hint {
                show {
                        @func refer
                        name defaults.namehint.basic
                }
                description "KODI to JACK 5.1 sink"
        }
}

ctl.jack_kodi {
	type hw
	card vc4hdmi0
}
```
