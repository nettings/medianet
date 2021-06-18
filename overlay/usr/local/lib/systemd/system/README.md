# Custom systemd services

## JACK server and clients

The general strategy of the medianet system is to have jackd and all clients
running as **systemd** services. These will always restart on any failure.
Before starting, they will wait for their upstream ports to become
available. After starting, they will attempt to connect their downstream
and upstream ports (the latter is redundant when the system is booted, but becomes
necessary if a service must be restarted during normal operation).

The ports to connect are listed in
```/etc/systemd/system/$foo.service.d/$foo.service.connections```.

These files are automatically generated from 
```/etc/medianet/config.json``` by
[```mn_config_update```](../overlay/usr/local/bin/mn_config_update). 


## systemd ordering issues

### Waiting for the system time to have settled down

The Raspberry Pi does not have an onboard real-time clock. After system
startup, a timestamp written during the previous shutdown is read and the
system time is tentatively set to that. So we will be off by the previous
downtime, which could be anything from minutes to weeks.

After that, *systemd-timesyncd* takes over and will attempt to contact NTP
servers from pool.ntp.org. It will take another minute or so to sync time.

There is a target called *time-sync.target* which is reached only after the
time has been synced.
However, systemd-timesyncd in its default configuration does not start
reliably if the /local partition is delayed at startup due to an unclean
shutdown. This error is persistent as of 2021-06-17 and leads to a crippled
system without a JACK graph in place. Since time jumps no longer seem to be
fatal to a running JACK even if it is using USB devices, mn_jackd.service is
no longer sequenced after time-sync.target.

### Waiting for the network to be available

Some services rely on a network connection to be fully up, i.e. including a
valid DHCP address and routing. The standard systemd target
*network-online.target* does not guarantee this, as per the systemd
philosophy of always choosing smart-ass generality over actual usefulness
and telling people to fix their daemons.

Similarly, we emulate this function with
[```mn_wait_net```](../overlay/usr/local/bin/mn_wait_net), which, since it
parses ```ip addr``` which is hopefully more stable, should be less fragile than
the solution for time mentioned above.

## Waiting for JACK ports to be available

We wait for JACK ports in two different cases:
1. to wait for a service's upstream ports to make sure the signal chain is
started in order; and
1. to wait for a service's own ports to make sure it's fully up before
attempting to make any connections (because systemd cannot know about this
when executing the *ExecStartPost* commands).

This is implemented by
[```mn_wait_jack```](../overlay/usr/local/bin/mn_wait_jack).

The corollary is that our service startup works only in the case of acyclic
JACK graphs. Since any branches and cycles would likely only ever happen
inside *mod-host* if at all, we accept this limitation for the sake of
simplicity and robustness.

