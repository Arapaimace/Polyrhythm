
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
  Text,
} from "@chakra-ui/react";

import { useState } from "react";
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

type ParseResponse = ParsedScore | { error: string };

interface UploadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onParsed: (result: ParsedScore) => void;
}

// Upload the selected file to FastAPI.
const sendFile = async (file: File) => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await axios.post(
    `${API_BASE}/upload`,
    formData,
    {
      timeout: 120000,
    }
  );

  return response.data;
};

// Request polyrhythm extraction from FastAPI.
const fetchPolyrhythm = async (
  startMeasure: number,
  endMeasure: number
): Promise<ParseResponse> => {
  const { data } = await axios.get<ParseResponse>(
    `${API_BASE}/parse`,
    {
      params: {
        start_measure: startMeasure,
        end_measure: endMeasure,
      },
      timeout: 120000,
    }
  );

  return data;
};

const UploadFileModal = ({
  isOpen,
  onClose,
  onParsed,
}: UploadFileModalProps) => {
  const [file, setFile] = useState<File | null>(null);

  const [startMeasure, setStartMeasure] = useState("1");
  const [endMeasure, setEndMeasure] = useState("2");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState("");

  const handleSubmit = async () => {
    if (!file || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Validate file extension.
      const allowedExtensions = [
        ".mscz",
        ".musicxml",
        ".xml",
      ];

      const extension = file.name
        .substring(file.name.lastIndexOf("."))
        .toLowerCase();

      if (!allowedExtensions.includes(extension)) {
        throw new Error(
          "Please upload an MSCZ, MusicXML, or XML file."
        );
      }

      // Validate measure range.
      const start = Number(startMeasure);
      const end = Number(endMeasure);

      if (
        !Number.isInteger(start) ||
        !Number.isInteger(end) ||
        start < 1 ||
        end < start
      ) {
        throw new Error(
          "Please enter a valid measure range."
        );
      }

      // Step 1: Upload.
      setStatus("Uploading score...");

      console.log("Uploading file:", file.name);

      const uploadResponse = await sendFile(file);

      console.log("Upload response:", uploadResponse);

      if (!uploadResponse.filename) {
        throw new Error(
          uploadResponse.error || "File upload failed."
        );
      }

      // Step 2: Extract polyrhythm.
      setStatus("Extracting polyrhythm...");

      console.log(
        `Parsing measures ${start} through ${end}`
      );

      const result = await fetchPolyrhythm(start, end);

      console.log("Parsing response:", result);

      if ("error" in result) {
        throw new Error(result.error);
      }

      // Basic response validation.
      if (
        !result.image_path ||
        !result.left ||
        !result.right ||
        !Array.isArray(result.left.onsets) ||
        !Array.isArray(result.right.onsets)
      ) {
        throw new Error(
          "The backend returned an invalid score response."
        );
      }

      // Step 3: Send extracted data to App.tsx.
      onParsed(result);

      // Step 4: Close modal.
      setStatus("");
      onClose();

    } catch (err) {
      console.error("File processing failed:", err);

      if (axios.isAxiosError(err)) {
        const backendError =
          err.response?.data?.detail ||
          err.response?.data?.error;

        setError(
          typeof backendError === "string"
            ? backendError
            : err.message
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred."
        );
      }

      setStatus("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;

    setError(null);
    setStatus("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      isCentered
    >
      <ModalOverlay />

      <ModalContent>
        <ModalCloseButton isDisabled={isSubmitting} />

        <ModalBody>
          <VStack
            align="stretch"
            spacing={4}
            py={4}
          >
            <Text fontSize="xl" fontWeight="bold">
              Upload Musical Score
            </Text>

            {/* File selection */}
            <HStack>
              <Button
                as="label"
                cursor="pointer"
                colorScheme="blue"
                isDisabled={isSubmitting}
              >
                Upload File

                <Input
                  type="file"
                  hidden
                  accept=".mscz,.musicxml,.xml"
                  onChange={(e) => {
                    const selectedFile =
                      e.target.files?.[0];

                    if (selectedFile) {
                      setFile(selectedFile);
                      setError(null);
                    }

                    // Allow selecting the same file again.
                    e.target.value = "";
                  }}
                />
              </Button>

              <Text
                paddingLeft="5%"
                fontSize="sm"
                wordBreak="break-word"
              >
                {file
                  ? file.name
                  : "Please upload a score"}
              </Text>
            </HStack>

            {/* Start measure */}
            <HStack>
              <Text minW="110px">
                Start measure
              </Text>

              <Input
                type="number"
                min={1}
                value={startMeasure}
                isDisabled={isSubmitting}
                onChange={(e) =>
                  setStartMeasure(e.target.value)
                }
              />
            </HStack>

            {/* End measure */}
            <HStack>
              <Text minW="110px">
                End measure
              </Text>

              <Input
                type="number"
                min={1}
                value={endMeasure}
                isDisabled={isSubmitting}
                onChange={(e) =>
                  setEndMeasure(e.target.value)
                }
              />
            </HStack>

            {/* Status */}
            {status && (
              <Text color="blue.500">
                {status}
              </Text>
            )}

            {/* Error */}
            {error && (
              <Text
                color="red.400"
                fontSize="sm"
              >
                {error}
              </Text>
            )}

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              isDisabled={!file || isSubmitting}
              isLoading={isSubmitting}
              loadingText="Processing"
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
