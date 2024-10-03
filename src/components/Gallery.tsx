import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  FlatList,
  useWindowDimensions,
  Alert,
  Share,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { BlurView } from "expo-blur";
import { useEffect, useState } from "react";
import RNFS from "react-native-fs";
import { dateFormatOptions } from "../shared/constants";

const Gallery = () => {
  const [files, setFiles] = useState<RNFS.ReadDirItem[]>([]);
  const [preview, setPreview] = useState<RNFS.ReadDirItem | null>(null);
  const { width } = useWindowDimensions();

  const readFiles = async () => {
    try {
      const files = await RNFS.readDir(RNFS.DocumentDirectoryPath);
      return files;
    } catch (error) {
      console.error("Error reading files: ", error);
      return [];
    }
  };

  const formatFileSize = (size: number) => {
    const i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    return (
      Number((size / Math.pow(1024, i)).toFixed(2)) * 1 +
      " " +
      ["B", "kB", "MB", "GB", "TB"][i]
    );
  };

  const modificationTime =
    preview && preview.mtime ? preview.mtime.getTime() : null;
  const size = preview ? preview.size : null;

  useEffect(() => {
    readFiles().then(setFiles);
  }, []);

  const padding = 1.5;

  return (
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
      <FlatList
        data={files}
        numColumns={4}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setPreview(item)}
            style={{ padding: 1.5 }}
          >
            <Video
              source={{ uri: "file://" + item.path }}
              style={{
                width: width / 4 - padding * 2,
                height: width / 4 - padding * 2,
              }}
              resizeMode={ResizeMode.COVER}
            />
          </TouchableOpacity>
        )}
      />
      {preview && (
        <BlurView
          intensity={20}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
          }}
        >
          <TouchableOpacity
            onPress={() => setPreview(null)}
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
                source={{ uri: "file://" + preview.path }}
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
                    Alert.alert(
                      "Are you sure you want to delete this recording?",
                      undefined,
                      [
                        { text: "Cancel", onPress: () => {}, style: "cancel" },
                        {
                          text: "Delete",
                          onPress: () => {
                            RNFS.unlink(preview.path)
                              .then(() => {
                                setPreview(null);
                                readFiles().then(setFiles);
                              })
                              .catch((err) =>
                                console.error("Error deleting file: ", err)
                              );
                          },
                          style: "destructive",
                        },
                      ]
                    );
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
                    Share.share({ url: "file://" + preview.path }).then(() =>
                      setPreview(null)
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
  );
};

export default Gallery;
