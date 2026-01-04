import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Input,
  HStack,
  Text
} from "@chakra-ui/react";


interface UploadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UploadFileModal = ({ isOpen, onClose }: UploadFileModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalBody>
          <HStack>
            <Button as="label">
              Upload File
              <Input 
                type="file" hidden
                accept=".mscz"
              />
            </Button>   
            <Text paddingLeft="5%">Please upload a .mscz score</Text>
          </HStack>       
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default UploadFileModal;
