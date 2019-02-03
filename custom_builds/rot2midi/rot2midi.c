#include <stdio.h>
#include <signal.h>
#include <unistd.h>
#include <wiringPi.h>
#include <jack/jack.h>
#include <jack/midiport.h>
#include <jack/ringbuffer.h>

#define JACK_CLIENT_NAME "rot2mid"
#define JACK_PORT_NAME "midi_out"
#define MIDI_CC 0xb
#define MIDI_CHN 0x0
#define MIDI_CCN 0x0
#define MIDI_SIZE 3

#define GPIO "/usr/bin/gpio"


jack_client_t *client;
jack_port_t *output_port;

#define MAX_CMD 256
unsigned char cmd[MAX_CMD];

#define MAX_PIN 3
enum { CLK, DT, SW };
int pin[MAX_PIN] = { 17, 27, 6 };

#define BUF_SIZE 32
jack_ringbuffer_t *buf_rotary;
jack_ringbuffer_t *buf_switch;


void syscmd(unsigned char* cmd) {
   int e;
   fprintf(stdout, "Executing %s...", cmd);       
   if (e = system(cmd) != 0) {
       fprintf(stdout, "failed with error %d.\n", e);
   } else {
       fprintf(stdout, "succeeded.\n");
   }
}

void handle_off() {
}

static void signal_handler(int sig) {
    fprintf(stderr, "Received signal, terminating.\n");
    /* JACK cleanup */
    jack_client_close(client);
    jack_ringbuffer_free(buf_rotary);
    jack_ringbuffer_free(buf_switch);
    
    /* wiringPi cleanup */
    wiringPiISR(pin[CLK], INT_EDGE_BOTH, handle_off);
    wiringPiISR(pin[SW], INT_EDGE_BOTH, handle_off);
    for (int i=0; i<MAX_PIN; i++) {
        snprintf(cmd, MAX_CMD, "%s edge %d none", GPIO, pin[i]);
        syscmd(cmd);
        snprintf(cmd, MAX_CMD, "%s unexport %d", GPIO, pin[i]);
        syscmd(cmd);
    }
    exit(0);
}

void handle_rotary() {
    static unsigned int prevClk;
    static unsigned char value;
    unsigned int clk, dt;
    static unsigned char msg[3] = { 
        (MIDI_CC << 4) + MIDI_CHN,
        MIDI_CCN,
        0
    };
    
    clk = digitalRead(pin[CLK]);
    if (clk != prevClk) {
        dt  = digitalRead(pin[DT]);
        if (dt != clk) {
            if (value < 127) value++;
        } else {
            if (value > 0) value--;
        }   
        msg[2] = value;
        fprintf(stdout,"<R%d|%d|%s> ", clk, value, msg);
        if (jack_ringbuffer_write(buf_rotary, msg, MIDI_SIZE) != MIDI_SIZE) {
            fprintf(stderr, "handle_rotary(): Ringbuffer overflow. Aborting.\n");
            signal_handler(SIGABRT);
        } 
    }
    prevClk = clk;
}

void handle_switch() {
    static unsigned char msg[3] = {
        (MIDI_CC << 4) + MIDI_CHN,
        MIDI_CCN + 1,
        0
    };
    
    int sw = digitalRead(pin[SW]);
    msg[2] = sw;
    fprintf(stdout,"<S%d> ", sw);
    if (jack_ringbuffer_write(buf_switch, msg, MIDI_SIZE) != MIDI_SIZE){
        fprintf(stderr, "handle_switch(): Ringbuffer overflow. Aborting.\n"); 
        signal_handler(SIGABRT);
    }
}

static int process(jack_nframes_t nframes, void *arg) {
    void* port_buf = jack_port_get_buffer(output_port, nframes);
    unsigned char buffer[3];
    jack_midi_data_t *dest;
    jack_nframes_t time = 0;
    jack_midi_clear_buffer(port_buf);
    while (jack_ringbuffer_read(buf_rotary, buffer, MIDI_SIZE) == MIDI_SIZE) {
        dest = jack_midi_event_reserve(port_buf, time++, MIDI_SIZE);
        dest = buffer;
    }
    return 0;
}

int main(int argc, char *argv[]) {
    setvbuf(stdout, NULL, _IONBF, 0);

    /* wiringPI setup */
    for (int i=0; i<MAX_PIN; i++) {
        snprintf(cmd, MAX_CMD, "%s export %d in", GPIO, pin[i]);
        syscmd(cmd);
        snprintf(cmd, MAX_CMD, "%s -g mode %d up", GPIO, pin[i]);
        syscmd(cmd);
    }
    wiringPiSetupSys();
    wiringPiISR(pin[CLK], INT_EDGE_BOTH, handle_rotary);
    wiringPiISR(pin[SW], INT_EDGE_BOTH, handle_switch);

    /* JACK setup */
    buf_rotary = jack_ringbuffer_create(BUF_SIZE);
    buf_switch = jack_ringbuffer_create(BUF_SIZE);
    jack_ringbuffer_mlock(buf_rotary);
    jack_ringbuffer_mlock(buf_switch);
    jack_nframes_t nframes;
    if((client = jack_client_open(JACK_CLIENT_NAME, JackNullOption, NULL)) == 0) {
        fprintf(stderr, "Failed to create client. Is the JACK server running?");
        return 1;
    }
    jack_set_process_callback (client, process, 0);
    output_port = jack_port_register (client, JACK_PORT_NAME, JACK_DEFAULT_MIDI_TYPE, JackPortIsOutput, 0);
    nframes = jack_get_buffer_size(client);

    if (jack_activate(client)) {
        fprintf (stderr, "Failed to activate client.\n");
        return 1;
    }
    signal(SIGTERM, signal_handler);
    signal(SIGINT, signal_handler);

    sleep(-1);
}