import { useKeepAwake } from "expo-keep-awake";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Home, Gallery } from "./src/components";

const Stack = createNativeStackNavigator();

const App = () => {
  useKeepAwake();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          autoHideHomeIndicator: true,
          headerStyle: {
            backgroundColor: "rgb(26, 28, 37)",
          },
          headerTitleStyle: {
            color: "white",
            fontSize: 20,
          },
        }}
      >
        <Stack.Screen
          name="Home"
          options={{ headerShown: false }}
          component={Home}
        />
        <Stack.Screen name="Gallery" component={Gallery} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
