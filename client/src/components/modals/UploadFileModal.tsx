import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  Button,
  Input,
  HStack,
  VStack,
  Text
} from "@chakra-ui/react";

import { useState } from "react"

import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

export interface PolyrhythmLayer {
  count: number;
  onsets: number[];
}

export interface ParsedScore {
  image_path: string;
  notes: unknown[];
  left: PolyrhythmLayer;
  right: PolyrhythmLayer;
}

interface UploadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onParsed: (result: ParsedScore) => void;
}

const sendFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  await axios.post(`${API_BASE}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

const fetchPolyrhythm = async (startMeasure: number, endMeasure: number) => {
  const { data } = await axios.get<ParsedScore>(`${API_BASE}/parse`, {
    params: { start_measure: startMeasure, end_measure: endMeasure },
  });
  return data;
};

const UploadFileModal = ({ isOpen, onClose, onParsed }: UploadFileModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [startMeasure, setStartMeasure] = useState("1");
  const [endMeasure, setEndMeasure] = useState("2");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!file) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await sendFile(file);
      const result = await fetchPolyrhythm(
        parseInt(startMeasure, 10) || 1,
        parseInt(endMeasure, 10) || 1
      );
      if ("error" in result) {
        setError((result as unknown as { error: string }).error);
        return;
      }
      onParsed(result);
      onClose();
    } catch (err) {
      setError("Couldn't extract a polyrhythm from that file/range.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="stretch" spacing={4} py={4}>
            <HStack>
              <Button as="label">
                Upload File
                <Input
                  type="file" hidden
                  accept=".mscz,.musicxml,.xml"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setFile(e.target.files[0]);
                    }
                  }}
                />
              </Button>
              <Text paddingLeft="5%">
                {file ? file.name : "Please upload a .mscz or .musicxml score"}
              </Text>
            </HStack>

            <HStack>
              <Text minW="110px">Start measure</Text>
              <Input
                type="number" min={1}
                value={startMeasure}
                onChange={(e) => setStartMeasure(e.target.value)}
              />
            </HStack>
            <HStack>
              <Text minW="110px">End measure</Text>
              <Input
                type="number" min={1}
                value={endMeasure}
                onChange={(e) => setEndMeasure(e.target.value)}
              />
            </HStack>

            {error && <Text color="red.400">{error}</Text>}

            <Button
              onClick={handleSubmit}
              isDisabled={!file}
              isLoading={isSubmitting}
              colorScheme="orange"
            >
              Extract Polyrhythm
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default UploadFileModal;
