# Remote logging

> This feature is currently under development and non-functional, let along
> ready for production.

For complex and/or long-term deployments, it helps to have persistent
logging for all medianet nodes. In the standard configuration, a medianet
system logs to RAM to prevent touching the SD card more than necessary, but
this means you are losing logging information when you need it most: after a
node has come down in flames.

To perform remote logging securely, log traffic must be encrypted, to
prevent leaking critical information to an attacker. Logging endpoints must
have strong authentication and authorization to prevent attacks on the
logging services themselves.

Recent systemd versions present since Debian bullseye have a usable and
secure remote logging feature that uses TLS.
Setting it up is non-trivial due to the OpenSSL server and client certificates
involved, but a few scripts will do the grunt work for you.


## Setting up a log server

You must designate one Pi on your network as the central log server. On this
machine, run
```
$ sudo /medianet/sbin/mn_setup_logserver
```
This script will perform the following tasks:
* create a Certificate Authority (CA) (configuration and self-signed root certificate)
* create and sign the logserver certificate
* create `/etc/systemd/journal-remote.conf`
* activate `systemd-journal-remote.service`
* create persistent logging directory `/local/log/journal`

The logging machine is now ready to accept remote log messages.

> Since `Storage=auto` (the default) in `journald.conf`, and we have a
> symlink `/var/log -> /local/log` by default, `systemd-journald`
> will start logging to `/local/log/journal` as soon as it is created.
>
> You may want to mount an SSD or even RAID system here in place of rubbing
> the SD card thin.


## Setting up the log client(s)

The logclients are being deployed from the logserver. For each client you
wish to integrate into the remote logging system, run
```
$ sudo /medianet/sbin/mn_setup_logclient $CLIENT
```
where `$CLIENT` is the hostname or IP address of the new logclient..

This script will perform the following tasks:
* create a Certificate Signing Request (CSR) for a client certificate
* sign the CSR with the logserver CA
* upload and install the signed certificate to the logclient
* deploy a '/etc/systemd/journal-upload.conf` on the logclient
* activate `systemd-journal-upload.service` on the logclient
* log a test message and check for correct reception.

