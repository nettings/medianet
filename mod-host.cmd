add http://invadarecords.com/plugins/lv2/compressor/stereo 1
add http://gareus.org/oss/lv2/fil4#stereo 2
add http://invadarecords.com/plugins/lv2/tube/stereo 3
add http://guitarix.sourceforge.net/plugins/gx_reverb_stereo#_reverb_stereo 4
add http://stackingdwarves.net/lv2/sm 9
param_set 1 bypass 1
param_set 3 bypass 1
param_set 4 dry_wet 0
connect effect_1:outL effect_2:inL
connect effect_1:outR effect_2:inR
connect effect_2:outL effect_3:inL
connect effect_2:outR effect_3:inR
connect effect_3:outL effect_4:in
connect effect_3:outR effect_4:in1
connect effect_4:out effect_9:inL
connect effect_4:out1 effect_9:inR
connect effect_9:outL system:playback_1
connect effect_9:outR system:playback_2 
connect zita-n2j:out_1 effect_1:inL
connect zita-n2j:out_2 effect_1:inR
