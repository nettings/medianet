# generates JACK output port connection list from JSON system configuration

# To avoid duplication of information, the configuration specifies only
# downstream connections, i.e. those of the output ports of a jack client.
# Since target port names can change depending on the configuration of the
# target unit, we do not store fully-qualified port names, but rather the 
# unit name of the target and an index into its port list (starting with
# zero). The actual port name is then looked up by the following jq script.

# The default usage is to list only the local parts of the port names in the
# unit configuration, with the understanding that the jackName and a colon
# (":") will be prepended to create a fully-qualified port name.
# Since mod-host creates individual jack clients named "effect_N" for each
# configured plugin, it must use fully-qualified port names in its unit
# configuration (indicated by the presence of a colon in the name).
# mod-host handles its own internal connections, so it exposes only its
# incoming and outgoing ports in the configuration.



# store array of all units for later use
.systemdUnits as $units
# iterate over all units
	| $units[]?
# find the desired unit, check if it is a jack client and enabled
	| select(.unit == $unit and .enabled == 1 and .jackName != null) as $u
# iterate over its output ports if they have target units and ports defined
	| (.outPorts[]? | select(.targetUnit) | select(.targetPort)) as $o
# only use those ports whose target unit is enabled
	| select($units[]? | select(.unit == $o.targetUnit) | select(.enabled == 1))
# construct connection pair (source newline sink)
# is the port name fully qualified (containing a ":")?
	|	if ($o.portName | contains(":"))
# if so, use as-is:
			then "\($o.portName)" 
# if not fully qualified, prepend client name
			else "\($u.jackName):\($o.portName)"
		end, "\n", (
# de-reference target ports via array of all units
			$units[]? 
# find the unit of the target port
			| select(.unit == $o.targetUnit) as $t
# find the target port using the array index
			| $t.inPorts[$o.targetPort].portName as $n
			| if ($n | contains(":"))
				then "\($n)"
				else "\($t.jackName):\($n)"
			end, "\n"
		)
	