import { Button, Icon } from "@chakra-ui/react";
import { FaPlay, FaPause } from "react-icons/fa";

interface PlayButtonProps {
  onClick: () => void;
  playing: boolean;
}

function PlayButton({ onClick, playing }: PlayButtonProps) {
  return (
    <Button
      onClick={onClick}
      borderRadius="full"
      boxSize="60px"
      bg={playing ? "blue.400" : "blue.400"}
      _hover={{ bg: playing ? "blue.500" : "blue.500" }}
      _active={{ bg: playing ? "blue.600" : "blue.600" }}
      color="white"
      p={0}
      display="flex"
      alignItems="center"
      justifyContent="center"
      shadow="md"
    >
      <Icon as={playing ? FaPause : FaPlay} boxSize="24px" />
    </Button>
  );
}

export default PlayButton;
