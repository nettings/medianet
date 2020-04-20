# [mn] medianet system configuration

This directory contains subdirectories corresponding to standard product
configurations, to serve as examples. Each directory contains a single
global configuration file ```medianet.json```, plus configuration-specific
data files if necessary.

The idea is that the complete state of a particular configuration is 
contained in here, so that a product can be rolled out and controlled
without directly touching the rest of the operating system image.

The active configuration directory is called ```this```, and it's best
practice to make it a symlink.

The file ```/medianet/config/this/medianet.json``` is being watched by a
systemd service called ```mn_config_watch```, so that any changes applied
are automatically deployed to the respective system configuration files.

You are advised to check ```sudo journalctl -e``` after editing for any
error messages. Simply touching the file is not sufficient to apply
changes, the file needs to be actually modified. 
Alternatively, you can call ```sudo mn_config_update``` by hand and see
the deployment process on the console.

Note that running services are not affected by the change, i.e. services
are enabled/disabled during deployment, but not started/stopped. 
Currently, a reboot is required to fully activate the new configuration.
This is done in order to ensure proper and frequent testing of the
boot-up sequence, which is important for a headless set-and-forget
device.
Should it become necessary in the future to change the configuration
during standard usage scenarios, it will be trivial to enable fine-
grained activation at run-time - we don't want that Windows user
experience. 
During testing, you can of course use the manual systemd commands to
start and stop required services.

## medianet.json syntax

Below is an annotated JSON file. Note that JSON does not allow comments,
so please remove anything after and including the "#" before copying
any of the following into a live configuration.

```
{
# concise label identifying this type of node
	"product"	: "Product-Shortname",
# a description of what this type of node does
	"description"	: "A product with features",
# hostnames must match [a-zA-Z0-9][a-zA-Z0-9-]{0,62}
        "hostname"	: "mn-basic",
# some location that makes sense to humans (or ICBM address, up to you)
	"location"	: "Up where we belong",
# the version ID is for your own use, an ISO date is recommended
	"version"	: "2020-04-01",


# Custom /boot/config.txt statements, will be included after the
# Raspbian defaults, so it can override them.
	"bootConfig"	: {
# You can use anything found in the Raspbian config.txt docs here.
# Most statements are considered singletons and may only occur once:
# This one is useful to pin the Pi in low-power mode:
		"arm_freq"	: 600,
# This one turns of HDMI and saves power on headless nodes:
		"hdmi_blanking"	: 2,
# The following statements can occur multiple times, hence they are
# represented by an array:
		"gpio"		: [
# This turns GPIOs 5, 6, and 13 to inputs and activates their
# pull-up resistors (for use with gpioctl or other things):
			"5,6,13=ip,pu"
		],
# This defines parameters for the standard overlay:
		"dtparam"	: [
# This disables the onboard audio (analog and HDMI):
			"audio=off"
		],
# This adds custom overlays:
		"dtoverlay"	: [
			"disable-wifi",
			"disable-bt",
			"hifiberry-dacplus"
		],
	}


# Here we define node-specific systemd services, their audio
# connections (if applicable), and other hacks:
	"systemdUnits"	: [
		{
# The name of the unit:
			"unit"		: "jackd",
# The type (currently, only services are supported):
			"type"		: "service",
# Set this to 0 to quickly disable a service without having
# to delete it from the configuration:
			"enabled"	: 1,
# This option is required for all JACK client units. It allows
# you to set a JACK client name other than the application
# default, if supported by the service (check the unit file for
# a "$JACKNAME" parameter).
# It also allows you to use relative port names if the JACK
# client name is different from the unit name.
			"jackName"      : "system",
# Options that are passed through to the service application.
# The service unit file may add default options.
			"options"       : "-R -t 4500 -P 70 -d alsa -d hw:sndrpihifiberry -P -r 48000 -p 128 -n 2 -z shaped"
# A list of JACK input ports:
			"inPorts"	: [ 
				{
                                        "portName"   : "playback_1"
                                },
                                {
                                        "portName"   : "playback_2"
                                }
                        ],
# A list of JACK output ports and their connection targets:
                        "outPorts": []
		}
	]
}
```
