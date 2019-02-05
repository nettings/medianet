#include "parse_cmdline.h"
#include <stdio.h>
#include <stdlib.h>
#include <getopt.h>
#include "globals.h"

void usage()
{
	printf
	    ("Creates JACK MIDI CC messages at %s:%s from a rotary encoder connected to Raspberry Pi GPIOs.\n",
	     JACK_CLIENT_NAME, JACK_PORT_NAME);
	printf("All pins are pulled up, so the return connectors be connected to ground.\n\n");
	printf("-h|--help                  This help.\n");
	printf("-v|--verbose               Print current controller values.\n");
	printf
	    ("-C|--clk [2-27]            The GPIO (not pin number) the CLK output of the encoder is wired to. Default: 17\n");
	printf
	    ("-D|--dt  [2-27]            The GPIO (not pin number) the DT output of the encoder is wired to. Default: 27\n");
	printf
	    ("-S|--sw  [2-27]            The GPIO (not pin number) the press-to-switch output is wired to. Defaults to inactive.\n");
	printf
	    ("-c|--channel [1-16]        The MIDI channel for the generated CC messages. Default: 1\n");
	printf
	    ("-r|--rotary [0-119]        The CC number for the rotary controller. Default: 0\n");
	printf
	    ("-i|--initial-value [0-127] The initial value of the controller. Default: 0\n");
	printf
	    ("-s|--switch [0-119]        The CC number for the switch: Default: 1\n");
	printf
	    ("-t|--toggle                Make switch a toggle (default is momentary)\n");
}

int parse_cmdline(int argc, char *argv[])
{
	int c;
	while (1) {
		static struct option long_options[] = {
			{"help", no_argument, 0, 'h'},
			{"verbose", no_argument, 0, 'v'},
			{"clk", required_argument, 0, 'C'},
			{"dt", required_argument, 0, 'D'},
			{"sw", required_argument, 0, 'S'},
			{"channel", required_argument, 0, 'c'},
			{"rotary", required_argument, 0, 'r'},
			{"initial-value", required_argument, 0, 'i'},
			{"switch", required_argument, 0, 's'},
			{"toggle", no_argument, 0, 't'},
			{0, 0, 0, 0}
		};
		int optind = 0;

		c = getopt_long(argc, argv, "hvC:D:S:c:r:i:s:t", long_options,
				&optind);
		if (c == -1)
			break;
		switch (c) {
		case 'h':
			usage();
			return(EXIT_USAGE);
			break;
		case 'v':
			verbose = 1;
			break;
		case 'C':
			pin[CLK] = atoi(optarg);
			if (pin[CLK] < 2 || pin[CLK] > 27) {
				fprintf(stderr,
					"%d is not a valid GPIO number.\n",
					pin[CLK]);
				usage();
				return(EXIT_ERR);
			}
			break;
		case 'D':
			pin[DT] = atoi(optarg);
			if (pin[DT] < 2 || pin[DT] > 27) {
				fprintf(stderr,
					"%d is not a valid GPIO number.\n",
					pin[DT]);
				usage();
				return(EXIT_ERR);
			}
			break;
		case 'S':
			pin[SW] = atoi(optarg);
			if (pin[SW] < 2 || pin[SW] > 27) {
				fprintf(stderr,
					"%d is not a valid GPIO number.\n",
					pin[SW]);
				usage();
				return(EXIT_ERR);
			}
			break;
		case 'c':
			midi_chn = atoi(optarg);
			if (midi_chn < 1 || midi_chn > 16) {
				fprintf(stderr,
					"%d is not a valid MIDI channel.\n",
					midi_chn);
				usage();
				return(EXIT_ERR);
			}
			break;
		case 'r':
			rotary_cc = atoi(optarg);
			if (rotary_cc < 0 || rotary_cc > 119) {
				fprintf(stderr,
					"%d is not a valid MIDI CC number.\n",
					rotary_cc);
				usage();
				return(EXIT_ERR);
			}
			break;
		case 'i':
			rotary_val = atoi(optarg);
			if (rotary_val < 0 || rotary_val > 127) {
				fprintf(stderr,
					"%d is not a valid MIDI CC value.\n",
					rotary_val);
				usage();
				return(EXIT_ERR);
			}
			break;
		case 's':
			switch_cc = atoi(optarg);
			if (switch_cc < 0 || switch_cc > 119) {
				fprintf(stderr,
					"%d is not a valid MIDI CC number.\n",
					switch_cc);
				usage();
				return(EXIT_ERR);
			}
			break;
		case 't':
			switch_toggled = 1;
			break;

		}
	}
}
