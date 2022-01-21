# [mn] medianet configuration
The entire state of a medianet node is collected in
`/etc/medianet/config.json`. This file is being watched for changes by 
mn_config.path (a [systemd path
unit](https://www.freedesktop.org/software/systemd/man/systemd.path.html)).
When a change in that file is detected, the `mn_config_update` command is
triggered and automatically generates all necessary configuration files for
the features provided by the medianet distribution overlay.

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

The outer framework of top-level elements is as follows (note that the
comments are not valid JSON, so you cannot cut-and-paste this example):
```
{
	// A short string describing what this particular setup does, 
        // ideally a token without whitespaces and special chars, 
        // shown on the login screen and available to scripts that include
        // /etc/mediant/config.inc as ${CONFIG_PRODUCT}.

	"product"     : "base_model",

	// A longer description of what this setup does, also shown on
        // the login screen and available as ${CONFIG_DESCRIPTION}: 

	"description" : "Example audio source with simple DSP chain, shairport-sync sink, zita-njbridge source and Icecast2 stream server",

	// This will be the actual hostname of this machine, so 
	// [a-z9-9]-] only and should not start with a number. It is
	// available as ${CONFIG_HOSTNME} (or via the ubiquitous env
	// variable $HOSTNAME).

	"hostname"    : "mn-basic",

	// An arbitrarily chosen string that helps you remember the 
	// physical whereabouts of this machine. Available as
	// ${CONFIG_LOCATION}.

	"location"    : "Mad Scientist Lab", 

	// An arbitrarily chosen string that helps you keep track of
	// configuration changes in longer-term deployments. Available
	// as ${CONFIG_VERSION}.

	"version"     : "2022-01-17", 

	// The following keys control the low-level configuration of
	// your Raspberry Pi as described in [/boot/config.txt](https://www.raspberrypi.com/documentation/computers/config_txt.html). 

	"bootConfig": {

		// dtparam and dtoverlay can occur multiple times, so they
		// are handled as arrays of strings:

		"dtparam"   : [

		// Every single dtparam setting becomes single string,
		// for example:

			"audio=off"
		],
		"dtoverlay" : [

		// Every single dtoverlay setting becomes a single string
		// value:

			"disable-wifi",
			"disable-bt"

		],

		// All other settings only occur a single time, so they are
		// handled as simple key/value pairs:

		"gpu_mem"  : 128
	},

	// All features of a medianet system are systemd services. They are
	// configured as follows:

	"systemdUnits": [
		{
			"unit"      : "foo.service",

		// This is redundant, because we do not currently handle
		// other unit types in config.json, and might go away in the
		// future:

			"type"      : "service",

		// A 0/1 value to allow configured units to be turned off
		// easily. Any unit that is not explicitly enabled in
		// config.json is assumed off (i.e. deleting a unit object
		// here will disable it)

			"enabled"   : 1,
		
		// JACK clients will honour the following option if the
		// underlying program supports setting the client name. If
		// it doesn't (such as with jackd itself, which always names
		// itself "system"), it must be set to the actual value the
		// jack client uses, so that connection management works
		// correctly.

			"jackName"  : "foo"

		// This is usually the full or a partial set of command line
		// options to the underlying program. Check the
		// corresponding service file in
		// `/medianet/overlay/usr/lib/systemd/system/mn_foo.service`
		// for details.

			"options"  : "-k -zMagic --anticipate_user_needs"
		}
	]
}
```

### example features

(to be done)
