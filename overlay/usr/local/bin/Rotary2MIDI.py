#!/usr/bin/python3

import sys, getopt, os.path

from RPi import GPIO
from time import sleep

import jack
from collections import deque

clk = 17
dt = 27

status = 0xB
channel = 0x1
controller = 0
value = 0
clkLastState = None
midiQueue = deque()

def help():
        print(os.path.basename(__file__), " [-h|--help] [-C|--clk n] [-D|--dt n] [-c|--channel n] [-n|--controller-no n] [-s|--start-value n]")
        print("Create JACK MIDI CC messages from a rotary encoder connected to Raspberry Pi GPIOs.")
        print()
        print("-h|--help                  This help.")
        print("-C|--clk [2-27]            The GPIO (not pin number) the CLK output of the encoder is wired to. Default: 17")
        print("-D|--dt [2-27]             The GPIO (not pin number) the DT output of the encoder is wired to. Default: 27")
        print("-c|--channel [1-16]        The MIDI channel for the generated CC messages. Default: 1")
        print("-n|--controller-no [0-119] The number of the CC. Default: 0")
        print("-s|--start-value [0-127]   The initial value of the controller. Default: 0")
        
def encoder(chn):
        global value, clkLastState, status, channel, controller, midiQueue
        clkState = GPIO.input(clk)
        if clkState != clkLastState:
                dtState = GPIO.input(dt)
                if dtState != clkState:
                        if value < 127:
                                value += 1 
                else:
                        if value > 0:
                                value -= 1
                midiQueue.append([(status << 4) + channel, controller, + value]);
                print("midiQueue latest: ", midiQueue[-1])
        clkLastState = clkState

def main(argv):
        global clk, dt, status, channel, controller, value, clkLastState
        try:
                opts, args = getopt.getopt(argv, "hC:D:c:n:s:", ["help", "clk", "dt", "channel", "controller-no", "start-value"])
        except getop.GetoptError:
                help();
                sys.exit(2)

        for opt,arg in opts:
                if opt in ('-h', '--help'):
                        help()
                        sys.exit(0)
                elif opt in ('-C', '--clk'):
                        try:
                                clk = int(arg)
                                if clk < 2 or clk > 27:
                                        raise ValueError
                        except ValueError:
                                print(arg, " is not a valid GPIO.")
                                sys.exit(2)
                elif opt in ('-D', '--dt'):
                        try:
                                dt = int(arg)
                                if dt < 2 or dt > 27:
                                        raise ValueError
                        except ValueError:
                                print(arg, " is not a valid GPIO.")
                                sys.exit(2)
                elif opt in ('-c', '--channel'):
                        try:
                                channel = int(arg)
                                if channel < 1 or channel > 16:
                                        raise ValueError
                        except ValueError:
                                print(arg, " is not a valid MIDI channel.")
                                sys.exit(2)
                elif opt in ('-n', '--controller-no'):
                        try:
                                controller = int(arg)
                                if controller < 0 or controller > 119:
                                        raise ValueError
                        except ValueError:
                                print(arg, " is not a valid CC number.")
                                sys.exit(2)
                                
                elif opt in ('-s', '--start-value'):
                        try:
                                value = int(arg)
                                if value < 0 or value > 127:
                                        raise ValueError
                        except ValueError:
                                print(arg, " is not a valid CC value.")
                                sys.exit(2)
                                
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(clk, GPIO.IN, pull_up_down=GPIO.PUD_UP)
        GPIO.setup(dt, GPIO.IN, pull_up_down=GPIO.PUD_UP)
        clkLastState = GPIO.input(clk)
        GPIO.add_event_detect(clk, GPIO.BOTH, callback=encoder, bouncetime=10)
        
        client = jack.Client('Rotary2MIDI')
        midiOut = client.midi_outports.register('midi_out')
        @client.set_process_callback
        def process(frames):
                global midiQueue
                offset = 0
                midiOut.clear_buffer()
                try:
                        while True:
                                midiOut.write_midi_event(offset, midiQueue.popleft())
                                offset += 1
                except IndexError:
                        0                
                        
        client.activate()
                
        input("")

        client.deactivate()
        client.close()
        GPIO.cleanup()
        
if __name__ == "__main__":
        main(sys.argv[1:])