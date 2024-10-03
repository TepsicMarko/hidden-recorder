import { StatusBar } from "expo-status-bar";
import {
  GestureResponderEvent,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useMicrophonePermission,
  useCameraFormat,
  VideoFile,
} from "react-native-vision-camera";
import * as FileSystem from "expo-file-system";
// @ts-expect-error
import GalleryImg from "../../assets/gallery.png";
import fs from "react-native-fs";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { dateFormatOptions } from "../shared/constants";

const Home = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const [isRecording, setIsRecording] = useState(false);
  const [stopRecordingVisible, setStopRecordingVisible] = useState(false);

  const cameraPermission = useCameraPermission();
  const microphonePermission = useMicrophonePermission();
  const cameraRef = useRef<Camera>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const device = useCameraDevice("back");
  const format = useCameraFormat(device, [
    { videoHdr: true, fps: 60, videoResolution: { width: 2560, height: 1440 } },
  ]);

  const handleRecordingFinished = async (video: VideoFile) => {
    const newName = new Date()
      .toLocaleDateString(undefined, {
        ...dateFormatOptions,
        second: "numeric",
      })
      .replaceAll("/", "-")
      .replaceAll(":", "-");

    fs.moveFile(video.path, FileSystem.documentDirectory! + newName + ".mov");
  };

  const startRecording = async () => {
    setIsRecording(true);

    if (cameraRef.current) {
      cameraRef.current.startRecording({
        videoBitRate: "high",
        videoCodec: "h265",
        onRecordingFinished: handleRecordingFinished,
        onRecordingError: (error) => console.error(error),
      });
    }
  };

  const stopRecording = async () => {
    if (cameraRef.current) cameraRef.current.stopRecording();
    setIsRecording(false);
  };

  const handlePress = (event: GestureResponderEvent) => {
    event.preventDefault();
    setStopRecordingVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setStopRecordingVisible(false), 2000);
  };

  useEffect(() => {
    if (!cameraPermission.hasPermission) cameraPermission.requestPermission();
    if (!microphonePermission.hasPermission)
      microphonePermission.requestPermission();

    return () => {
      if (cameraRef.current && isRecording) cameraRef.current.stopRecording();
    };
  }, [cameraPermission, microphonePermission, isRecording]);

  if (!device) return null;

  return (
    <View style={{ flex: 1, position: "relative" }}>
      <StatusBar style="dark" hidden />

      <Camera
        isActive={isFocused}
        video
        audio
        videoStabilizationMode="off"
        format={format}
        videoHdr={format?.supportsVideoHdr}
        style={{ height: "100%", width: "100%" }}
        device={device}
        ref={cameraRef}
      />

      <View
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
          backgroundColor: isRecording ? "black" : "transparent",
          justifyContent: "flex-end",
          position: "absolute",
          zIndex: 10,
        }}
      >
        <TouchableWithoutFeedback style={{ flex: 1 }} onPress={handlePress}>
          <View
            style={{
              width: "100%",
              height: 110,
              bottom: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
              paddingBottom: 10,
            }}
          >
            <View
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                style={{ left: 20 }}
                onPress={() => navigation.navigate("Gallery")}
              >
                <Image
                  source={GalleryImg}
                  style={{
                    display: isRecording ? "none" : "flex",
                    width: 40,
                    height: 40,
                  }}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={{
                opacity: !isRecording || stopRecordingVisible ? 1 : 0,
                width: 75,
                height: 75,
                borderRadius: 75,
                backgroundColor: "transparent",
                borderWidth: 4,
                borderColor: "rgb(255,255,255)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "absolute",
              }}
              disabled={isRecording && !stopRecordingVisible}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <View
                style={{
                  width: isRecording ? 30 : 63,
                  height: isRecording ? 30 : 63,
                  borderRadius: isRecording ? 8 : 63,
                  backgroundColor: "rgb(255, 47, 71)",
                }}
              />
            </TouchableOpacity>
            <View style={{ flexGrow: 1 }} />
          </View>
        </TouchableWithoutFeedback>
      </View>
    </View>
  );
};

export default Home;
