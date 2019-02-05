#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>
#include <signal.h>
#include <errno.h>
#include "globals.h"
#include "parse_cmdline.h"

#include "jack_process.h"
#include "gpio_process.h"
#include "ringbuffer.h"

// defaults:
int verbose = 0;
unsigned char midi_chn = 1;
unsigned char rotary_cc = 0;
unsigned char rotary_val = 0;
unsigned char rotary_msg[];
unsigned char switch_cc = 1;
unsigned char switch_val = 0;
unsigned char switch_msg[];
int switch_toggled = 0;
int pin[] = { 17, 27, PIN_INACTIVE };

static void signal_handler(int sig)
{
	fprintf(stderr, "Received signal, terminating.\n");
	shutdown_JACK();
	shutdown_GPIO();
	shutdown_ringbuffer();
}

int main(int argc, char *argv[])
{
	int rval = parse_cmdline(argc, argv);
	if (rval != EXIT_CLEAN) {
		exit(rval);
	}
	
	rotary_msg[0] = switch_msg[0] = (MIDI_CC << 4) + (midi_chn - 1);
	rotary_msg[1] = rotary_cc;
	switch_msg[1] = switch_cc;

	setup_ringbuffer();
	setup_JACK();
	setup_GPIO();
	
	signal(SIGTERM, signal_handler);
	signal(SIGINT, signal_handler);

	sleep(-1);
}
