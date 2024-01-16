import { StatusBar } from "expo-status-bar";
import {
  FlatList,
  GestureResponderEvent,
  Image,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Pressable,
  Share,
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
import { ResizeMode, Video } from "expo-av";
// @ts-expect-error
import GalleryImg from "./assets/gallery.png";
// @ts-expect-error
import CloseIcon from "./assets/close.png";
import { BlurView } from "expo-blur";
import fs from "react-native-fs";

const dateFormatOptions = {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  // second: "numeric",
} as const;

const App = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [stopRecordingVisible, setStopRecordingVisible] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [files, setFiles] = useState<FileSystem.FileInfo[]>([]);
  const [preview, setPreview] = useState<FileSystem.FileInfo>();
  const cameraPermission = useCameraPermission();
  const microphonePermission = useMicrophonePermission();
  const cameraRef = useRef<Camera>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const device = useCameraDevice("back");
  const format = useCameraFormat(device, [
    { videoHdr: true, fps: 60, videoResolution: { width: 1920, height: 1080 } },
  ]);
  const videoDir = FileSystem.documentDirectory?.replace(
    "Documents",
    "tmp/ReactNative"
  );

  const startRecording = async () => {
    setIsRecording(true);
    if (cameraRef.current) {
      cameraRef.current.startRecording({
        videoBitRate: "high",
        onRecordingFinished: (video) => {
          const newName = new Date().toLocaleDateString(
            undefined,
            dateFormatOptions
          );

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

  const formatFileSize = (size: number) => {
    const i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    return (
      Number((size / Math.pow(1024, i)).toFixed(2)) * 1 +
      " " +
      ["B", "kB", "MB", "GB", "TB"][i]
    );
  };

  const readFiles = async () => {
    const files = await FileSystem.readDirectoryAsync(
      FileSystem.documentDirectory!
    );
    const filesInfo = await Promise.all(
      files.map((file) =>
        FileSystem.getInfoAsync(FileSystem.documentDirectory + file)
      )
    );

    setFiles(filesInfo);
  };

  useEffect(() => {
    if (!cameraPermission.hasPermission) cameraPermission.requestPermission();
    if (!microphonePermission.hasPermission)
      microphonePermission.requestPermission();
  }, [cameraPermission, microphonePermission]);

  if (!device) return null;

  const modificationTime =
    preview && "modificationTime" in preview ? preview!.modificationTime : null;
  const size = preview && "size" in preview ? preview!.size : null;

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <StatusBar style="dark" hidden />
      <Camera
        isActive
        video
        audio
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
                  onPress={() => {
                    setIsGalleryOpen(true);
                    readFiles();
                  }}
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
      {isGalleryOpen && (
        <View
          style={{
            backgroundColor: "rgb(33, 35, 46)",
            width: "100%",
            height: "100%",
            position: "absolute",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <View
            style={{
              flexGrow: 1,
              maxHeight: 110,
              paddingTop: 50,
              backgroundColor: "rgb(26, 28, 37)",
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                flexGrow: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 26,
                  fontWeight: "600",
                  color: "rgb(237, 237, 237)",
                  fontFamily: "Roboto",
                }}
              >
                Gallery
              </Text>
              <TouchableOpacity
                onPress={() => setIsGalleryOpen(false)}
                style={{
                  position: "absolute",
                  right: 25,
                }}
              >
                <Image
                  source={CloseIcon}
                  style={{
                    maxHeight: 20,
                    maxWidth: 20,
                  }}
                />
              </TouchableOpacity>
            </View>
          </View>
          <FlatList
            data={files}
            numColumns={4}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => setPreview(item)}>
                <Video
                  source={{ uri: item.uri }}
                  style={{ width: 100, height: 100 }}
                  resizeMode={ResizeMode.COVER}
                />
              </TouchableOpacity>
            )}
          />
          {preview && (
            <BlurView
              intensity={20}
              style={{ position: "absolute", width: "100%", height: "100%" }}
            >
              <TouchableOpacity
                onPress={() => setPreview(undefined)}
                style={{
                  flexGrow: 1,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Pressable
                  onPress={(e) => e.preventDefault()}
                  style={{
                    opacity: 1,
                    width: "90%",
                    height: 500,
                    borderRadius: 20,
                    overflow: "hidden",
                    backgroundColor: "rgb(26, 28, 37)",
                  }}
                >
                  <Video
                    source={{ uri: preview.uri }}
                    style={{ flexGrow: 1 }}
                    useNativeControls
                    resizeMode={ResizeMode.COVER}
                  />
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: 16,
                      marginBottom: 16,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 20,
                        color: "rgb(255,255,255)",
                        backgroundColor: "transparent",
                        fontWeight: "700",
                      }}
                    >
                      {modificationTime
                        ? new Date(modificationTime * 1000).toLocaleDateString(
                            undefined,
                            dateFormatOptions
                          )
                        : "unknown"}
                    </Text>
                    {size && (
                      <Text
                        style={{
                          fontSize: 20,
                          color: "rgb(255,255,255)",
                          backgroundColor: "transparent",
                          fontWeight: "300",
                          textTransform: "lowercase",
                        }}
                      >
                        {formatFileSize(size)}
                      </Text>
                    )}
                  </View>
                  <View
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "row",
                      paddingHorizontal: 16,
                      marginBottom: 16,
                    }}
                  >
                    <Pressable
                      style={{
                        flexGrow: 1,
                        height: 40,
                        backgroundColor: "rgb(252, 167, 167)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 10,
                        marginRight: 12,
                      }}
                      onPress={() => {
                        FileSystem.deleteAsync(preview.uri);
                        readFiles();
                        setPreview(undefined);
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "700",
                          fontFamily: "Roboto",
                          color: "rgb(103, 0, 0)",
                        }}
                      >
                        Delete
                      </Text>
                    </Pressable>
                    <Pressable
                      style={{
                        flexGrow: 1,
                        height: 40,
                        backgroundColor: "rgb(150, 169, 255)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 10,
                      }}
                      onPress={() =>
                        Share.share({ url: preview.uri }).then(() =>
                          setPreview(undefined)
                        )
                      }
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "700",
                          fontFamily: "Roboto",
                          color: "rgb(0, 20, 110)",
                        }}
                      >
                        Share
                      </Text>
                    </Pressable>
                  </View>
                </Pressable>
              </TouchableOpacity>
            </BlurView>
          )}
        </View>
      )}
    </View>
  );
};

export default App;
