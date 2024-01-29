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
    { videoHdr: true, fps: 60, videoResolution: { width: 1920, height: 1080 } },
  ]);

  const startRecording = async () => {
    setIsRecording(true);
    if (cameraRef.current) {
      cameraRef.current.startRecording({
        videoBitRate: "high",
        onRecordingFinished: (video) => {
          const newName = new Date().toLocaleDateString(undefined, {
            ...dateFormatOptions,
            second: "numeric",
          });

          fs.moveFile(
            video.path,
            FileSystem.documentDirectory! + newName + ".mov"
          );

          console.log("recording finished");
        },
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
  }, [cameraPermission, microphonePermission]);

  if (!device) return null;

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <StatusBar style="dark" hidden />
      <Camera
        isActive={isFocused}
        video
        audio
        videoStabilizationMode="off"
        format={format}
        videoHdr={format?.supportsVideoHdr}
        style={{ flex: 1 }}
        device={device}
        ref={cameraRef}
      >
        <TouchableWithoutFeedback style={{ flex: 1 }} onPress={handlePress}>
          <View
            style={{
              flex: 1,
              backgroundColor: isRecording ? "black" : "transparent",
            }}
          >
            <View
              style={{
                width: "100%",
                height: 110,
                position: "absolute",
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
                  flexGrow: 1,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <TouchableOpacity
                  style={{
                    position: "absolute",
                    left: 20,
                  }}
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
                  bottom: 0,
                }}
                onPress={isRecording ? stopRecording : startRecording}
              >
                <View
                  style={{
                    width: isRecording ? 30 : 63,
                    height: isRecording ? 30 : 63,
                    borderRadius: isRecording ? 8 : 63,
                    backgroundColor: "rgb(255, 47, 71)",
                  }}
                ></View>
              </TouchableOpacity>
              <View style={{ flexGrow: 1 }} />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Camera>
    </View>
  );
};

export default Home;
