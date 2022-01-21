# [mn] medianet configuration
The entire state of a medianet node is collected in
`/etc/medianet/config.json`. This file is being watched for changes by 
mn_config.path (a [systemd path
unit](https://www.freedesktop.org/software/systemd/man/systemd.path.html)).
When a change in that file is detected, the `mn_config_update` command is
triggered and automatically generates all necessary configuration files for
the features provided by the medianet distribution overlay.

You can provision or re-provision a running medianet node by dropping a new
config file in the proper place, waiting for the `mn_config_update`
background task to complete its job (you can watch its progress with `sudo
journalctl -f`), and rebooting.

## config.json syntax

The config file is a serialized JSON object, which makes it accessible to
automated deployment tools. It does however have a few differences compared
to other common configuration file formats:
* You cannot use comments.
* You cannot use tab or other meta characters inside string literals (the
JSON structure itself may well be formatted with tabs for better readability).
Unfortunately, this precludes the use of multiline strings, which would
sometimes improve readability.
* All keys are case sensitive.

### top level structure

The outer framework of top-level elements is as follows:
```
{
```
A short string describing what this particular setup does, 
ideally a token without whitespaces and special chars, 
shown on the login screen and available to scripts that include
/etc/mediant/config.inc as ${CONFIG_PRODUCT}.
```
	"product"     : "base_model",
```
A longer description of what this setup does, also shown on
the login screen and available as ${CONFIG_DESCRIPTION}: 
```
	"description" : "Example audio source with simple DSP chain, shairport-sync sink, zita-njbridge source and Icecast2 stream server",
```
This will be the actual hostname of this machine, so 
[a-z9-9]-] only and should not start with a number. It is
available as ${CONFIG_HOSTNME} (or via the ubiquitous env
variable $HOSTNAME).
```
	"hostname"    : "mn-basic",
```
An arbitrarily chosen string that helps you remember the 
physical whereabouts of this machine. Available as
${CONFIG_LOCATION}.
```
	"location"    : "Mad Scientist Lab", 
```
An arbitrarily chosen string that helps you keep track of
configuration changes in longer-term deployments. Available
as ${CONFIG_VERSION}.
```
	"version"     : "2022-01-17", 
```
The following keys control the low-level configuration of
your Raspberry Pi as described in [/boot/config.txt](https://www.raspberrypi.com/documentation/computers/config_txt.html). 
```
	"bootConfig": {
```
dtparam and dtoverlay can occur multiple times, so they
are handled as arrays of strings:
```
		"dtparam"   : [
```
Every single dtparam setting becomes single string, for example:
```
			"audio=off"
		],
		"dtoverlay" : [
```
Every single dtoverlay setting becomes a single string
value:
```
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
All features of a medianet system are systemd services. They are
configured as follows:
```
	"systemdUnits": [
		{
			"unit"      : "mn_foo",
```
This is redundant, because we do not currently handle
unit types other than "service" in config.json, and the
option might go away in the future:
```
			"type"      : "service",
```
A 0/1 value to allow configured units to be turned off
easily. Any unit that is not explicitly enabled in
config.json is assumed off (i.e. deleting a unit object
here will disable it)
```
			"enabled"   : 1,
```		
JACK clients will honour the following option if the
underlying program supports setting the client name. If
it doesn't (such as with jackd itself, which always names
itself "system"), it must be set to the actual value the
jack client uses, so that connection management works
correctly.
```
			"jackName"  : "foo"
```
This is either the full set of command line options to the
underlying program, or a partial set with some settings 
hardcoded into the corresponding service file. Check
`/medianet/overlay/usr/lib/systemd/system/mn_foo.service`
for details.
The *options* mechanism is used for programs that can be
completely configured via the command line.
```
			"options"  : "-k -zMagic --anticipate_user_needs"
```
For programs that read their configuration from a
configuration file, the *config* mechanism is used. It
consists of a simple array of strings, which will be
written out into the corresponding config file by
mn_config_update, which knows the name and location of
said file.
```
			"config"   : [
				"first line of config statements",
				"second line of config statements"
			],
```
JACK clients can optionally define inPorts and outPorts.
The ports thus defined are handled by the automatic
connection management. You cannot change the names via
this mechanism, port names have to match what the client
is actually providing. inPorts and outPorts are arrays of
objects. When the client name matches the jackName, you
only need to list the relative port names after the colon
(see jack_lsp). If they don't, as is the case with
mod-host for example, you will have to provide a fully
qualified port name.
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
outPorts can optionally specifiy the targetUnit and port
index (of that unit's list of inPorts) they want to be
connected to. The port index starts with 0. I regret that
choice now, but we're stuck with it for the time being.
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

The system tries to connect all JACK clients on startup according to the
connections specified in `config.json`. If a client dies and is restarted,
both its up- and downstream connections are reconnected automatically.

If a connection fails, the service will fail after a timeout, and attempt to
restart. This sometimes leads to undesired behaviour, where it would be
better to keep a service running in a degraded state with one or more
failed connections rather than attempting restarts. The heuristic for the
port connection may change in the future.

## example configuration snippets

### jackd using the RPi 4b's built-in PWM minijack output

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
tasklet handlers, so it cannot starve the audio device.

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

### jackd using the RPi 4B's HDMI output

```
{
	"unit"    : "mn_jackd",
	"type"    : "service",
	"enabled" : 1,
	"jackName": "system",
	"options" : "-R -P40 -d alsa -d hdmi:CARD=vc4hdmi0,DEV=0 -r 48000 -n 2 -p 512", 
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
This setting will only work if an audio-capable HDMI sink is connected to the Pi.
Ways to force-hotplug the hardware to always provide this device and to
enable up to 8 channel playback for surround sound applications are
currently under investigation.

### jackd using the HifiBerry DAC+ADC

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

### mod-host

mod-host provides an easy way to run a DSP chain of LV2 plugins on the Pi.
Its setup is slightly tricky because each plugin running in mod-host
presents as a separate JACK client called effect_N, where N is an index set
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
