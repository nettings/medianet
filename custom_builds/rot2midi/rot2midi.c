#include <stdio.h>
#include <signal.h>
#include <unistd.h>
#include <errno.h>
#include <pthread.h>
#include <getopt.h>
#include <wiringPi.h>
#include <jack/jack.h>
#include <jack/midiport.h>
#include <jack/ringbuffer.h>

#define JACK_CLIENT_NAME "rot2midi"
#define JACK_PORT_NAME "midi_out"
#define MIDI_CC 0xb
#define MIDI_MAX 0x7f
#define MIDI_SIZE 3
#define NONE 255

#define GPIO "/usr/bin/gpio"

jack_client_t *client;
jack_port_t *output_port;

// command buffer for GPIO configuration
#define MAX_CMD 256
unsigned char cmd[MAX_CMD];

// GPIO pin handling
#define MAX_PIN 3
enum { CLK, DT, SW };
int pin[MAX_PIN] = { 17, 27, 6 };

int verbose = 0;
unsigned char midi_chn = 1;
unsigned char rotary_cc = 0;
unsigned char rotary_val = 0;
unsigned char rotary_msg[3];
unsigned char switch_cc = NONE;
unsigned char switch_val = 0;
unsigned char switch_msg[3];
int switch_toggled = 0;


// event ringbuffer and lock
#define BUF_SIZE 128
jack_ringbuffer_t *buf;
pthread_mutex_t buflock = PTHREAD_MUTEX_INITIALIZER;

void usage() {
    printf("Creates JACK MIDI CC messages at %s:%s from a rotary encoder connected to Raspberry Pi GPIOs.\n\n", JACK_CLIENT_NAME, JACK_PORT_NAME);
    printf("-h|--help                  This help.\n");
    printf("-v|--verbose               Print current controller values.\n");
    printf("-C|--clk [2-27]            The GPIO (not pin number) the CLK output of the encoder is wired to. Default: 17\n");
    printf("-D|--dt  [2-27]            The GPIO (not pin number) the DT output of the encoder is wired to. Default: 27\n");
    printf("-S|--sw  [2-27]            The GPIO (not pin number) the press-to-switch output is wired to. Defaults to inactive.\n");
    printf("-c|--channel [1-16]        The MIDI channel for the generated CC messages. Default: 1\n");
    printf("-r|--rotary [0-119]        The CC number for the rotary controller. Default: 0\n");
    printf("-i|--initial-value [0-127] The initial value of the controller. Default: 0\n");
    printf("-s|--switch [0-119]        The CC number for the switch: Default: 1\n");
    printf("-t|--toggle                Make switch a toggle (default is momentary)\n");
}

void syscmd(unsigned char* cmd) {
   int e;
   if (e = system(cmd) != 0) {
       fprintf(stderr, "%s failed with error %d.\n", cmd, e);
   } else if (verbose) {
       fprintf(stdout, "%s succeeded.\n", cmd);
   }
}

void handle_off() {
}

static void signal_handler(int sig) {
    fprintf(stderr, "Received signal, terminating.\n");
    /* JACK cleanup */
    jack_client_close(client);
    jack_ringbuffer_free(buf);
    
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
    unsigned int clk, dt, nbytes;
    
    clk = digitalRead(pin[CLK]);
    if (clk != prevClk) {
        dt  = digitalRead(pin[DT]);
        if (dt != clk) {
            if (rotary_val < 127) rotary_val++;
        } else {
            if (rotary_val > 0) rotary_val--;
        }   
        rotary_msg[2] = rotary_val;
        if (verbose) {
            fprintf(stdout,"<R%d|0x%02x%02x%02x>\n", clk, rotary_msg[0], rotary_msg[1], rotary_msg[2]);
        }
        pthread_mutex_lock(&buflock);
        nbytes = jack_ringbuffer_write(buf, rotary_msg, MIDI_SIZE);
        pthread_mutex_unlock(&buflock);
        if (nbytes != MIDI_SIZE) {
            fprintf(stderr, "handle_rotary(): Ringbuffer overflow.\n");
        } 
    }
    prevClk = clk;
}

void handle_switch() {
    static unsigned int prevVal;
    unsigned int sw, nbytes;
    
    sw = 1 - digitalRead(pin[SW]); // inverted logic, pull-up to ground
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
            fprintf(stdout,"<S%d|0x%02x%02x%02x>\n", sw, switch_msg[0], switch_msg[1], switch_msg[2]);
        }
        pthread_mutex_lock(&buflock);
        nbytes = jack_ringbuffer_write(buf, switch_msg, MIDI_SIZE);
        pthread_mutex_unlock(&buflock);
        if (nbytes != MIDI_SIZE){
            fprintf(stderr, "handle_switch(): Ringbuffer overflow.\n"); 
        }
    }
    prevVal = switch_val;
}

static int process(jack_nframes_t nframes, void *arg) {
    void* port_buf = jack_port_get_buffer(output_port, nframes);
    unsigned char buffer[3];
    jack_midi_data_t *dest;
    jack_nframes_t time = 0;
    jack_midi_clear_buffer(port_buf);
    while (jack_ringbuffer_read(buf, buffer, MIDI_SIZE) == MIDI_SIZE) {
        if (jack_midi_event_write(port_buf, time++, buffer, MIDI_SIZE) == ENOBUFS) {
            //error handling goes here
        }
    }
    return 0;
}

int main(int argc, char *argv[]) {
    setvbuf(stdout, NULL, _IONBF, 0);

    int c;
    while (1) {
        static struct option long_options[] = {
            { "help", no_argument, 0, 'h' },
            { "verbose", no_argument, 0, 'v' },
            { "clk", required_argument, 0, 'C' },
            { "dt", required_argument, 0, 'D' },
            { "sw", required_argument, 0, 'S' },
            { "channel", required_argument, 0, 'c' },
            { "rotary", required_argument, 0, 'r' },
            { "initial-value", required_argument, 0, 'i' },
            { "switch", required_argument, 0, 's' },
            { "toggle", no_argument, 0, 't' },
            { 0, 0, 0, 0 }
        };
        int optind = 0;
        
        c = getopt_long (argc, argv, "hvC:D:S:c:r:i:s:t", long_options, &optind);
        if (c == -1) break;
        switch (c) {
            case 'h':
                usage();
                exit(0);
                break;
            case 'v': 
                verbose = 1;
                break;
            case 'C':
                pin[CLK] = atoi(optarg);
                if (pin[CLK] < 2 || pin[CLK] > 27) {
                    fprintf(stderr, "%d is not a valid GPIO number.\n", pin[CLK]);
                    usage();
                    exit(2);
                }
                break;
            case 'D':
                pin[DT] = atoi(optarg);
                if (pin[DT] < 2 || pin[DT] > 27) {
                    fprintf(stderr, "%d is not a valid GPIO number.\n", pin[DT]);
                    usage();
                    exit(2);
                }
                break;
            case 'S':
                pin[SW] = atoi(optarg);
                if (pin[SW] < 2 || pin[DT] > SW) {
                    fprintf(stderr, "%d is not a valid GPIO number.\n", pin[SW]);
                    usage();
                    exit(2);
                }
                break;
            case 'c':
                midi_chn = atoi(optarg);
                if (midi_chn < 1 || midi_chn > 16) {
                    fprintf(stderr, "%d is not a valid MIDI channel.\n", midi_chn);
                    usage();
                    exit(2);
                }
                break;
            case 'r':
                rotary_cc = atoi(optarg);
                if (rotary_cc < 0 || rotary_cc > 119) {
                    fprintf(stderr, "%d is not a valid MIDI CC number.\n", rotary_cc);
                    usage();
                    exit(2);
                }
                break;
            case 'i':
                rotary_val = atoi(optarg);
                if (rotary_val < 0 || rotary_val > 127) {
                    fprintf(stderr, "%d is not a valid MIDI CC value.\n", rotary_val);
                    usage();
                    exit(2);
                }
                break;
            case 's':
                switch_cc = atoi(optarg);
                if (switch_cc < 0 || switch_cc > 119) {
                    fprintf(stderr, "%d is not a valid MIDI CC number.\n", switch_cc);
                    usage();
                    exit(2);
                }
                break;
            case 't':
                switch_toggled = 1;
                break;
                
        }
    }
    rotary_msg[0] = switch_msg[0] = (MIDI_CC << 4) + midi_chn;
    rotary_msg[1] = rotary_cc;    
    switch_msg[1] = switch_cc;

    /* wiringPI setup */
    for (int i=0; i<MAX_PIN; i++) {
        snprintf(cmd, MAX_CMD, "%s export %d in", GPIO, pin[i]);
        syscmd(cmd);
        snprintf(cmd, MAX_CMD, "%s -g mode %d up", GPIO, pin[i]);
        syscmd(cmd);
    }
    wiringPiSetupSys();
    wiringPiISR(pin[CLK], INT_EDGE_BOTH, handle_rotary);
    if (switch_cc != NONE) {
        wiringPiISR(pin[SW], INT_EDGE_BOTH, handle_switch);
    }
    /* JACK setup */
    buf = jack_ringbuffer_create(BUF_SIZE);
    jack_ringbuffer_mlock(buf);
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