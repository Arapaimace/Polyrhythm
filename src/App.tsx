import {
  Center,
  Box,
  VStack,
  HStack,
  Button,
  Heading
} from '@chakra-ui/react'

const setLeftInput = (input) => {
  return null;
}

const setRightInput = (input) => {
  return null;
}

function App() {
  return (
    <>
      <Center mt={6}>
        <Heading color="black">Polyrhythm Metronome</Heading>
      </Center>

      <Box background="#000000" w="100%" h="100%">
        <Center w="100vw" h="100vh">
          <VStack spacing={4}>
            <Box position="relative" w="40vw">
              <HStack
                position="absolute"
                top="-40px"
                w="100%"
                justifyContent="space-between"
              >
                <Button>Configure Left Input</Button>
                <Button>Configure Right Button</Button>
              </HStack>

              <Box
                bg="black"
                borderWidth="1px"
                borderColor="white"
                p={4}
                borderRadius="md"
                w="100%"
                h="40vh"
              />
            </Box>
          </VStack>
        </Center>
      </Box>
    </>
  )
}

export default App
