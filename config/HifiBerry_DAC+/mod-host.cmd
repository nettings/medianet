# medianet mod-host configuration
add http://gareus.org/oss/lv2/fil4#stereo 1
add urn:zamaudio:ZamCompX2 2
add http://stackingdwarves.net/lv2/sm 3
connect effect_1:outL effect_2:lv2_audio_in_1
connect effect_1:outR effect_2:lv2_audio_in_2
connect effect_2:lv2_audio_out_1 effect_3:inL
connect effect_2:lv2_audio_out_2 effect_3:inR
connect effect_3:outL system:playback_1
connect effect_3:outR system:playback_2
connect zita-n2j:out_1 effect_1:inL
connect zita-n2j:out_2 effect_1:inR
