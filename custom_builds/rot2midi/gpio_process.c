#include "gpio_process.h"
#include <stdio.h>
#include <stdlib.h>
#include <wiringPi.h>
#include "globals.h"
#include "ringbuffer.h"

#define GPIO "/usr/bin/gpio"
// command buffer for GPIO configuration
#define MAX_CMD 256
unsigned char cmd[MAX_CMD];

static void syscmd(unsigned char *cmd)
{
	int e;
	if (e = system(cmd) != 0) {
		fprintf(stderr, "%s failed with error %d.\n", cmd, e);
	} else if (verbose) {
		fprintf(stdout, "%s succeeded.\n", cmd);
	}
}

static void handle_rotary()
{
	static unsigned int prevClk;
	unsigned int clk, dt;

	clk = digitalRead(pin[CLK]);
	if (clk != prevClk) {
		dt = digitalRead(pin[DT]);
		if (dt != clk) {
			if (rotary_val < 127)
				rotary_val++;
		} else {
			if (rotary_val > 0)
				rotary_val--;
		}
		rotary_msg[2] = rotary_val;
		if (verbose) {
			fprintf(stdout, "<R%d|0x%02x%02x%02x>\n", clk,
				rotary_msg[0], rotary_msg[1], rotary_msg[2]);
		}
		if (ringbuffer_write(rotary_msg, MSG_SIZE) != MSG_SIZE) {
			fprintf(stderr, "handle_rotary(): Ringbuffer overflow.");
		};
	}
	prevClk = clk;
}

static void handle_switch()
{
	static unsigned int prevVal;
	unsigned int sw;

	sw = 1 - digitalRead(pin[SW]);	// inverted logic, pull-up to ground
	if (switch_toggled) {
		if (sw) {
			switch_val = MIDI_MAX - switch_val;
		}
	} else {
		switch_val = sw * MIDI_MAX;
	}
	if (switch_val != prevVal) {
		switch_msg[2] = switch_val;
		if (verbose) {
			fprintf(stdout, "<S%d|0x%02x%02x%02x>\n", sw,
				switch_msg[0], switch_msg[1], switch_msg[2]);
		}
		if (ringbuffer_write(switch_msg, MSG_SIZE) != MSG_SIZE) {
			fprintf(stderr, "handle_switch(): Ringbuffer overflow.");
		};
	}
	prevVal = switch_val;
}

static void handle_off() {
	// do nothing.
}

void setup_GPIO() {
	for (int i = 0; i < NPINS; i++) {
		if (pin[i] != PIN_INACTIVE) {
			snprintf(cmd, MAX_CMD, "%s export %d in", GPIO, pin[i]);
			syscmd(cmd);
			snprintf(cmd, MAX_CMD, "%s -g mode %d up", GPIO, pin[i]);
			syscmd(cmd);
		}
	}
	wiringPiSetupSys();
	if (pin[CLK] != PIN_INACTIVE && pin[DT] != PIN_INACTIVE) {
		fprintf(stdout, "Setting up rotary handler for pin %d.\n", pin[CLK]);
		wiringPiISR(pin[CLK], INT_EDGE_BOTH, handle_rotary);
	}
	if (pin[SW] != PIN_INACTIVE) {
		wiringPiISR(pin[SW], INT_EDGE_BOTH, handle_switch);
	}
}

void shutdown_GPIO() {
        wiringPiISR(pin[CLK], INT_EDGE_BOTH, handle_off);
        wiringPiISR(pin[SW], INT_EDGE_BOTH, handle_off);
        for (int i = 0; i < NPINS; i++) {
                snprintf(cmd, MAX_CMD, "%s edge %d none", GPIO, pin[i]);
                syscmd(cmd);
                snprintf(cmd, MAX_CMD, "%s unexport %d", GPIO, pin[i]);
                syscmd(cmd);
        }
}

