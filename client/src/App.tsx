import {
  Center,
  Box,
  VStack,
  HStack,
  Button,
  Heading,
  Input,
  Text,
  Image,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure
} from '@chakra-ui/react'

import { useState, useEffect, useRef } from "react"

import useSound from 'use-sound';
import snare from './components/sound/snare.wav'
import kick from './components/sound/kick.wav'
import metronome from './components/sound/metronome.wav'
import PlayButton from './components/ui/playButton'
import UploadFileModal, { ParsedScore } from "./components/modals/UploadFileModal";

const API_BASE = "http://127.0.0.1:8000";

// Evenly-spaced onsets for a given beat count, e.g. evenOnsets(3) -> [0, 1/3, 2/3]
const evenOnsets = (count: number): number[] =>
  Array.from({ length: Math.max(count, 1) }, (_, i) => i / Math.max(count, 1));

const clampBeat = (n: number) => Math.min(13, Math.max(1, n));

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
  const { isOpen, onOpen, onClose } = useDisclosure();

  const beats = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
  const [leftBeat, setLeftBeat] = useState<number>(1);
  const [rightBeat, setRightBeat] = useState<number>(1);

  // Onset positions (0-1 fractions of the measure) for each layer. Defaults
  // to even subdivision, but a parsed score can replace these with the
  // extracted polyrhythm's real onset timing.
  const [leftOnsets, setLeftOnsets] = useState<number[]>(evenOnsets(1));
  const [rightOnsets, setRightOnsets] = useState<number[]>(evenOnsets(1));

  const [scoreImage, setScoreImage] = useState<string | null>(null);

  const [progress, setProgress] = useState(0);
  const requestRef = useRef<number>();
  const startTimeRef = useRef<number>();

  const leftSet = () => setConfiguring("left");
  const rightSet = () => setConfiguring("right");

  const chooseLeftBeat = (beat: number) => {
    setLeftBeat(beat);
    setLeftOnsets(evenOnsets(beat));
    setPlay("pause");
  };

  const chooseRightBeat = (beat: number) => {
    setRightBeat(beat);
    setRightOnsets(evenOnsets(beat));
    setPlay("pause");
  };

  const handleParsed = (result: ParsedScore) => {
    const leftCount = clampBeat(result.left.count);
    const rightCount = clampBeat(result.right.count);
    setLeftBeat(leftCount);
    setRightBeat(rightCount);
    setLeftOnsets(result.left.onsets.length ? result.left.onsets : evenOnsets(leftCount));
    setRightOnsets(result.right.onsets.length ? result.right.onsets : evenOnsets(rightCount));
    setScoreImage(`${API_BASE}${result.image_path}?t=${Date.now()}`);
    setPlay("pause");
  };

  // Single animation-frame loop drives both playback of the two rhythm
  // layers and the progress bar, comparing each frame's position in the
  // measure against every onset to fire it exactly once per pass. Using one
  // rAF loop (rather than setInterval per layer) avoids drift and lets each
  // layer use arbitrary (not just evenly-spaced) onset positions.
  useEffect(() => {
    if (play !== "play") {
      setProgress(0);
      return;
    }

    const beatDuration = (60 / bpm) * 1000;
    const beatsPerMeasure = Math.max(leftBeat, rightBeat);
    const measureLength = beatDuration * beatsPerMeasure;

    let lastFrac = 0;
    let firstFrame = true;

    const fireCrossed = (onsets: number[], from: number, to: number, wrapped: boolean, play: () => void) => {
      onsets.forEach((f) => {
        const crossed = wrapped ? (f > from || f <= to) : (f > from && f <= to);
        if (crossed) play();
      });
    };

    const animate = (time: number) => {
      if (!startTimeRef.current) startTimeRef.current = time;
      const elapsed = time - startTimeRef.current;
      const frac = (elapsed % measureLength) / measureLength;
      setProgress(frac);

      if (firstFrame) {
        firstFrame = false;
        if (leftOnsets[0] === 0) playKick();
        if (rightOnsets[0] === 0) playSnare();
        playMetronome();
        lastFrac = frac;
      } else {
        const wrapped = frac < lastFrac;
        fireCrossed(leftOnsets, lastFrac, frac, wrapped, playKick);
        fireCrossed(rightOnsets, lastFrac, frac, wrapped, playSnare);
        if (wrapped) playMetronome();
        lastFrac = frac;
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      startTimeRef.current = undefined;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play, bpm, leftBeat, rightBeat, leftOnsets, rightOnsets]);

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
              <Button
                variant="outline"
                onClick={leftSet}
                bg="black.100"
                color="white"
              >
                Left Input: ({leftInput})
              </Button>
              <Button
                onClick={rightSet}
                variant="outline"
                bg="black.100"
                color="white"
              >
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
                  {leftOnsets.map((frac, i) => (
                    <Box
                      key={`left-pill-${i}`}
                      w="30px"
                      h="10px"
                      bg="teal.300"
                      borderRadius="full"
                      position="absolute"
                      left={`${frac * 100}%`}
                      transform="translateX(-50%)"
                    />
                  ))}
                </Box>

                <Box w="100%" position="relative" h="20px">
                  {rightOnsets.map((frac, i) => (
                    <Box
                      key={`right-pill-${i}`}
                      w="30px"
                      h="10px"
                      bg="pink.300"
                      borderRadius="full"
                      position="absolute"
                      left={`${frac * 100}%`}
                      transform="translateX(-50%)"
                    />
                  ))}
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
                    onClick={() => chooseLeftBeat(beat)}
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
                    onClick={() => chooseRightBeat(beat)}
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
            <Button
              paddingLeft="8%"
              paddingRight="8%"
              bg="orange.400"
              color="blue.800"
              variant="outline"
              onClick={onOpen}
            > Upload Score
            </Button>
            <UploadFileModal isOpen={isOpen} onClose={onClose} onParsed={handleParsed} />
          </HStack>

          {scoreImage && (
            <Box maxW="40vw">
              <Image src={scoreImage} alt="Extracted score excerpt" borderRadius="md" />
            </Box>
          )}
        </VStack>
      </Center>
    </Box>
  );
}

export default App;
