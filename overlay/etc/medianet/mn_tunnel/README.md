# mn_tunnel Maintenance tunnel

Sometimes a medianet machine might be deployed behind a firewall or
masquerading router that does not have a public IP, yet you might need to
access it for maintenance purposes.

In this case, you can instruct the machine to "phone home" to a public IP
via SSH and open a remote tunnel that allows you to tunnel an SSH session
back into it.

## configuration

Please check `mn_tunnel.conf` in this directory, it should be
self-explanatory.
Note that since the tunnel is not connected to a shell, you will not be able
to manually accept the tunnel server's host key. Instead, you can obtain and
store it by running
```
$ . /etc/medianet/mn_tunnel.conf \
  && ssh-keyscan -p $TUNNEL_PORT -H $TUNNEL_HOST  > $TUNNEL_HOST_FINGERPRINT
```
(The variables are explained in the config file.)

## activation

The tunnel is activated by creating a magic file, and will thus persist
across reboots unless you disable the underlying systemd services.
The location of said magic file is configurable and defaults to
`/var/lib/mn_tunnel/active`.

There is an example web interface at http://localhost//medianet/Tunnel/ that allows you
(or a user of the machine) to control and verify the maintenance tunnel.

## systemd services

The magic file is watched by `mn_tunnel_watch.path`, which in turn triggers
`mn_tunnel_watch.service`, which restarts `mn_tunnel.service` on demand.
The tunnel itself is a simple SSH session that is created whenever the user needs it. 

## tunnel usage

From your $TUNNEL_HOST, you can access your medianet machine through the
tunnel as follows:
```
user@${TUNNEL_HOST}:~> ssh -p ${TUNNEL_PORT_ACCESS} medianet@localhost
```
Alternatively, use the "jump" option to directly tunnel to your medianet
machine from another host:
```
user@yourbox:~> ssh -J ${TUNNEL_USER}@${TUNNEL_HOST}:${TUNNEL_PORT} \
	-p ${TUNNEL_PORT_ACCESS} \
	medianet@localhost
```
## side note

Yes, this directory contains a real, syntactically correct private key for documentation
purposes.

No, it does not give you access to any real machine. :o)
