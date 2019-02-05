#!/bin/bash

for i in ringbuffer gpio_process jack_process parse_cmdline ; do
	echo Building "$i".c:
	gcc -c "$i".c
done

gcc -ljack -lwiringPi -lpthread *.o main.c -o rot2midi
