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

import { useState, useEffect, useRef } from "react"

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

  const [progress, setProgress] = useState(0);
  const requestRef = useRef<number>();
  const startTimeRef = useRef<number>();

  const leftSet = () => setConfiguring("left");
  const rightSet = () => setConfiguring("right");
  

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

    playKick();
    playSnare();

    const idKick = setInterval(playKick, measureLength / leftBeat);
    const idSnare = setInterval(playSnare, measureLength / rightBeat);
    const idMetronome = setInterval(playMetronome, measureLength);

    return () => {
      clearInterval(idKick);
      clearInterval(idSnare);
      clearInterval(idMetronome);
    };
  }, [play, bpm, leftBeat, rightBeat, playKick, playSnare, playMetronome]);

  useEffect(() => {
    if (play !== "play") {
      setProgress(0);
      return;
    }

    const beatDuration = (60 / bpm) * 1000;
    const beatsPerMeasure = Math.max(leftBeat, rightBeat);
    const measureLength = beatDuration * beatsPerMeasure;

    const animate = (time: number) => {
      if (!startTimeRef.current) startTimeRef.current = time;
      const elapsed = time - startTimeRef.current;
      const frac = (elapsed % measureLength) / measureLength;
      setProgress(frac);
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      startTimeRef.current = undefined;
    };
  }, [play, bpm, leftBeat, rightBeat]);

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
                Left Input: ({leftInput})
              </Button>
              <Button onClick={rightSet}>
                Right Input: ({rightInput})
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
              position="relative"
              overflow="hidden"
            >
              <Box
                position="absolute"
                top={0}
                bottom={0}
                width="4px"
                bg="orange.300"
                left={`${progress * 100}%`}
                transform="translateX(-50%)"
              />

              <VStack
                position="absolute"
                top={0}
                bottom={0}
                left={0}
                right={0}
                justify="space-between"
                p={4}
                pointerEvents="none"
              >
                <Box w="100%" position="relative" h="20px">
                  {[...Array(leftBeat)].map((_, i) => {
                    const position = (i / leftBeat) * 100;
                    return (
                      <Box
                        key={`left-pill-${i}`}
                        w="30px"
                        h="10px"
                        bg="teal.300"
                        borderRadius="full"
                        position="absolute"
                        left={`${position}%`}
                        transform="translateX(-50%)"
                      />
                    );
                  })}
                </Box>

                <Box w="100%" position="relative" h="20px">
                  {[...Array(rightBeat)].map((_, i) => {
                    const position = (i / rightBeat) * 100;
                    return (
                      <Box
                        key={`right-pill-${i}`}
                        w="30px"
                        h="10px"
                        bg="pink.300"
                        borderRadius="full"
                        position="absolute"
                        left={`${position}%`}
                        transform="translateX(-50%)"
                      />
                    );
                  })}
                </Box>
              </VStack>
            </Box>
          </Box>

          <HStack>
            <Menu>
              <MenuButton as={Button} variant="outline" size="md" color="white">
                L: {leftBeat}
              </MenuButton>
              <MenuList>
                {beats.map((beat) => (
                  <MenuItem 
                    key={`left-${beat}`} 
                    onClick={() => {
                      setLeftBeat(beat);
                      setPlay("pause");
                    }}
                  >
                    {beat}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>

            <Menu>
              <MenuButton as={Button} variant="outline" size="md" color="white">
                R: {rightBeat}
              </MenuButton>
              <MenuList>
                {beats.map((beat) => (
                  <MenuItem 
                    key={`right-${beat}`} 
                    onClick={() => {
                      setRightBeat(beat);
                      setPlay("pause");
                    }}
                  >
                    {beat}
                  </MenuItem>
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
                  setPlay("pause");
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
