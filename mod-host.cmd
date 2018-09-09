# medianet mod-host configuration
add http://gareus.org/oss/lv2/fil4#stereo 1
add http://stackingdwarves.net/lv2/sm 2
connect effect_1:outL effect_2:inL
connect effect_1:outR effect_2:inR
connect effect_2:outL system:playback_1
connect effect_2:outR system:playback_2
connect zita-n2j:out_1 effect_1:inL
connect zita-n2j:out_2 effect_1:inR
