# Changes

### 2024-02-24 deprecate mn_autostart*.service
Please move over to using mn_shell-{command|process}[-root]@.service.
These are templates, so you have to add a suffix of your choice behind the
`@`, which also allows you to run more than one instance of each service.

### 2023-12-04 Changes in RaspiOS "Bookworm"

#### /boot is now /boot/firmware
The bootfs partition is now mounted under /boot/firmware, which means that
the kernel images, initrds and other stuff now reside on the main system
partition. Only the bootloaders and device trees remain.

> Upgrading between major releases has never been supported really. As
> usual, you are much better off taking your configuration file off your old
> system and dropping it into a fresh one.

#### cpufrequtils is deprecated
If you are using `mn_cpufreq.service`, please replace it with
`mn_cpupower.service`. The old service will likely be removed with the next
major Debian update.

#### zita-njbridge is now up to date upstream
We no longer have to make our own custom build, and the .checkout and .build
scripts have therefore been removed.

#### zita-lrx has been removed
If you have been relying on the speaker crossover functionality of zita-lrx,
please consider moving to the LSP crossover plugin - you can add it to
mod-host via the LV2 URL http://lsp-plug.in/plugins/lv2/crossover_stereo.

#### jackminimix has been removed
Nobody ever used it, and the x42 matrix mixer is a suitable replacement (its
LV2 URL is http://gareus.org/oss/lv2/matrixmixer#i12o10).

#### mod-host is again tracking HEAD
With a more up-to-date jackd in Bookworm, we can finally track the latest
mod-host development again after having to freeze it for most of bullseye.

#### more surgical configuration
Where possible, we are now no longer replacing the distro config files, but
using drop-ins as much as possible. This allows us to apply the changes we
need, and still benefit from baseline configuration updates provided by
upstream. This affects `lighttpd`, `systemd-logind`, and `systemd-journald`.

