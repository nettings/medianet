#ifndef GLOBALS_H
#define GLOBALS_H

#define JACK_CLIENT_NAME "rot2midi"
#define JACK_PORT_NAME "midi_out"
#define NPINS 3
#define MIDI_MAX 0x7f
#define MIDI_CC 0xb
#define MSG_SIZE 3

enum { CLK, DT, SW };

int verbose;
unsigned char midi_chn;
unsigned char rotary_cc;
unsigned char rotary_val;
unsigned char rotary_msg[MSG_SIZE];
unsigned char switch_cc;
unsigned char switch_val;
unsigned char switch_msg[MSG_SIZE];
int switch_toggled;
int pin[NPINS];

#endif
