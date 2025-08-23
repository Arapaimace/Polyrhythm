import {
  Center,
  Box,
  VStack,
  HStack,
  Button,
  Heading,
  Input,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem
} from '@chakra-ui/react'

import { useState, useEffect } from "react"

import useSound from 'use-sound';
import snare from './components/sound/snare.wav'
import kick from './components/sound/kick.wav'
import metronome from './components/sound/metronome.wav'
import PlayButton from './components/ui/playButton'

function App() {
  const [playSnare] = useSound(snare);
  const [playKick] = useSound(kick);
  const [playMetronome] = useSound(metronome);
  const [leftInput, setLeftInput] = useState('a');
  const [rightInput, setRightInput] = useState('l');
  const [configuring, setConfiguring] = useState<"left" | "right" | null>(null);
  const [bpmInput, setBpmInput] = useState("100");
  const [bpm, setBpm] = useState(100);
  const [play, setPlay] = useState<"play" | "pause">("pause");

  const beats = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
  const [leftBeat, setLeftBeat] = useState<number>(1);
  const [rightBeat, setRightBeat] = useState<number>(1);

  const leftSet = () => {
    setConfiguring("left");
  };

  const rightSet = () => {
    setConfiguring("right");
  };

  const handleKeydown = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();

    if (configuring === "left") {
      setLeftInput(key);
      setConfiguring(null);
    } else if (configuring === "right") {
      setRightInput(key);
      setConfiguring(null);
    } else {
      if (key === leftInput) {
        playKick();
      } else if (key === rightInput) {
        playSnare();
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [leftInput, rightInput, configuring]);

  useEffect(() => {
    if (play !== "play") return;

    const beatDuration = (60 / bpm) * 1000;
    const beatsPerMeasure = Math.max(leftBeat, rightBeat);
    const measureLength = beatDuration * beatsPerMeasure;

    const idKick = setInterval(playKick, measureLength / leftBeat);
    const idSnare = setInterval(playSnare, measureLength / rightBeat);
    const idMetronome = setInterval(playMetronome, measureLength);

    return () => {
      clearInterval(idKick);
      clearInterval(idSnare);
      clearInterval(idMetronome);
    };
  }, [play, bpm, leftBeat, rightBeat, playKick, playSnare, playMetronome]);


  return (
    <Box bgGradient="radial(black, gray.900, gray.800)" w="100%" h="100vh">
      <Center w="100vw" h="calc(100vh - 80px)">
        <VStack spacing={4}>
          <Box position="relative" w="40vw">
            <HStack
              position="absolute"
              top="-40px"
              w="100%"
              justifyContent="space-between"
            >
              <Button onClick={leftSet}>
                Configure Left Input
              </Button>
              <Button onClick={rightSet}>
                Configure Right Input
              </Button>
            </HStack>

            {configuring && (
              <Heading size="md" color="white" textAlign="center" mt={6}>
                Press a key to configure the {configuring} input
              </Heading>
            )}

            <Box
              bgGradient="linear(to-r, gray.800, blue.900)"
              borderWidth="1px"
              borderColor="black"
              p={4}
              borderRadius="md"
              w="100%"
              h="40vh"
            />
          </Box>

          <HStack>
            <Menu>
              <MenuButton as={Button} variant="outline" size="md" color="white">
                Ratio (L)
              </MenuButton>
              <MenuList>
                {beats.map((beat) => (
                  <MenuItem key={`left-${beat}`}  onClick = {() => setLeftBeat(beat)}>{beat}</MenuItem>
                ))}
              </MenuList>
            </Menu>

            <Menu>
              <MenuButton as={Button} variant="outline" size="md" color="white">
                Ratio (R)
              </MenuButton>
              <MenuList>
                {beats.map((beat) => (
                  <MenuItem key={`right-${beat}`} onClick = {() => setRightBeat(beat)}>{beat}</MenuItem>
                ))}
              </MenuList>
            </Menu>

            <PlayButton 
              playing={play === "play"} 
              onClick={() => {
                setPlay(prev => {
                  const next = prev === "play" ? "pause" : "play";
                  if (next === "play") {
                    playMetronome();
                  }
                  return next;
                });
              }} 
            />
            <Text fontWeight="bold" color="blue.100">BPM: </Text>
            <Input
              color="blue.100"
              w="35%"
              type="number"
              min={30}
              max={300}
              value={bpmInput}
              onChange={(e) => {
                const txt = e.target.value;
                setBpmInput(txt);
                const n = parseInt(txt, 10);
                if (!isNaN(n) && n >= 30 && n <= 300) {
                  setBpm(n);
                }
              }}
            />
          </HStack>
        </VStack>
      </Center>
    </Box>
  );
}

export default App;
