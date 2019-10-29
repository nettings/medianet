# [mn] medianet system configuration

This directory contains subdirectories corresponding to standard product
configurations, to serve as examples. Each directory contains a single
global configuration file ```medianet.json``` plus eventually
configuration-specific data files. The idea is that the complete state of
a particular configuration is contained in here, so that a product can be
rolled out and controlled without directly touching the rest of the
operating system image.

The active configuration directory is called ```this```, and it's best practice
to make it a symlink.

The file ```/medianet/config/this/medianet.json``` is being
watched by a systemd service called ```mn_config_watch```, so that any changes
applied are automatically deployed to the respective system configuration
files. You are advised to check ```sudo journalctl -e``` after editing for any
error messages. Simply touching the file is not sufficient to apply changes,
the file needs to be actually modified. 
Alternatively, you can call ```sudo mn_config_update``` by hand and see the
deployment process on the console.

Note that running services are not affected by the change, i.e. services are
enabled/disabled during deployment, but not started/stopped. 
Currently, a reboot is required to fully activate the new configuration.
This is done in order to ensure proper and frequent testing of the boot-up
sequence, which is important for a headless set-and-forget device.
Should it become necessary in the future to change the configuration during
standard usage scenarios, it will be trivial to enable fine-grained
activation at run-time - we don't want that Windows user experience. 
During testing, you can of course use the manual systemd commands to start
and stop required services.
