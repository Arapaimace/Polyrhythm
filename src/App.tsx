import { Box, Container, Heading, Text, VStack, Button, HStack } from '@chakra-ui/react'
import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="center">
          <Heading size="2xl" color="blue.600">
            Polyrhythm
          </Heading>
          <Text fontSize="lg" color="gray.600" textAlign="center">
            Interactive polyrhythm website
          </Text>
          
          <Box 
            p={8} 
            bg="white" 
            borderRadius="lg" 
            boxShadow="md"
            w="full"
            maxW="md"
          >
            <VStack spacing={4}>
              <Text fontSize="xl" fontWeight="semibold">
                Welcome to your new React + Chakra UI app!
              </Text>
              
              <HStack spacing={4}>
                <Button 
                  colorScheme="blue" 
                  onClick={() => setCount(count + 1)}
                >
                  Count is {count}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setCount(0)}
                >
                  Reset
                </Button>
              </HStack>
              
              <Text fontSize="sm" color="gray.500" textAlign="center">
                This is a skeleton project with React, TypeScript, Vite, and Chakra UI.
                Start building your polyrhythm application!
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
}

export default App 