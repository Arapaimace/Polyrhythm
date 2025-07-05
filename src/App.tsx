import {
  Center,
  Box,
  VStack,
  HStack,
  Button,
  Heading
} from '@chakra-ui/react'

import React, { useState, useEffect } from "react"


function App() {
  const [leftInput, setLeftInput] = useState('a');
  const [rightInput, setRightInput] = useState('l');
  const [lastKeyPressed, setLastKeyPressed] = useState("");
  const [configuring, setConfiguring] = useState<"left" | "right" | null>(null);

  const leftSet = () => {
    setConfiguring("left");
  };

  const rightSet = () => {
    setConfiguring("right");
  };

  const handleKeydown = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    setLastKeyPressed(key);

    if (configuring === "left") {
      setLeftInput(key);
      setConfiguring(null);
    } else if (configuring === "right") {
      setRightInput(key);
      setConfiguring(null);
    } else {
      if (key === leftInput) {
        console.log("Matched Left Input!");
      } else if (key === rightInput) {
        console.log("Matched Right Input!");
      } else {
        console.log("No Match");
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
                onClick={() => {
                  leftSet();
                }}
              >
                Configure Left Input
              </Button>

              <Button
                onClick={() => {
                  rightSet();
                }}
              >
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
        </VStack>
      </Center>
    </Box>
  );
}

export default App
