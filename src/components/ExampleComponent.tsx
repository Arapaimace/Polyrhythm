import { Box, Text, Badge } from '@chakra-ui/react'

interface ExampleComponentProps {
  title: string
  description: string
  tags?: string[]
}

export function ExampleComponent({ title, description, tags = [] }: ExampleComponentProps) {
  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg="white">
      <Text fontSize="lg" fontWeight="bold" mb={2}>
        {title}
      </Text>
      <Text color="gray.600" mb={3}>
        {description}
      </Text>
      {tags.length > 0 && (
        <Box>
          {tags.map((tag, index) => (
            <Badge key={index} colorScheme="blue" mr={2} mb={1}>
              {tag}
            </Badge>
          ))}
        </Box>
      )}
    </Box>
  )
} 