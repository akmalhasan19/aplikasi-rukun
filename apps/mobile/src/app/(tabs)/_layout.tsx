import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { View, Platform, Easing, Dimensions } from "react-native";
import { primeActiveTab, syncActiveTabFromNavigatorState } from "./tab-transition";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function TabLayout() {
    useEffect(() => {
        primeActiveTab("index");
    }, []);

    return (
        <Tabs
            screenListeners={{
                state: (event: any) => {
                    syncActiveTabFromNavigatorState(event?.data?.state);
                },
            }}
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: "#FFFFFF",
                    borderTopWidth: 1,
                    borderTopColor: "#F3F4F6",
                    paddingBottom: Platform.OS === "ios" ? 24 : 12,
                    paddingTop: 12,
                    height: Platform.OS === "ios" ? 88 : 72,
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    position: "absolute",
                    elevation: 8,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: -5 },
                    shadowOpacity: 0.05,
                    shadowRadius: 20,
                },
                tabBarActiveTintColor: "#1E1E24",
                tabBarInactiveTintColor: "#9CA3AF",
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: "700",
                },
                tabBarIconStyle: {
                    marginTop: 4,
                },
                transitionSpec: {
                    animation: "timing",
                    config: {
                        duration: 300,
                        easing: Easing.bezier(0.22, 0.8, 0.22, 1),
                    },
                },
                // Full-width directional slide:
                // left tabs sit at -width, right tabs sit at +width, focused tab at 0.
                sceneStyleInterpolator: ({ current }: any) => ({
                    sceneStyle: {
                        transform: [
                            {
                                translateX: current.progress.interpolate({
                                    inputRange: [-1, 0, 1],
                                    outputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
                                }),
                            },
                        ],
                    },
                }),
                sceneStyle: {
                    backgroundColor: "#F5F7FA",
                    overflow: "hidden",
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    lazy: false,
                    animation: "none",
                    sceneStyleInterpolator: () => ({
                        sceneStyle: {
                            opacity: 1,
                            transform: [{ translateX: 0 }],
                        },
                    }),
                    tabBarIcon: ({ color, focused }) => (
                        <View
                            style={{
                                backgroundColor: focused ? "#F3F4F6" : "transparent",
                                padding: 4,
                                borderRadius: 12,
                            }}
                        >
                            <Ionicons name="home" size={24} color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="iuran"
                options={{
                    title: "Iuran",
                    lazy: false,
                    animation: "none",
                    sceneStyleInterpolator: () => ({
                        sceneStyle: {
                            opacity: 1,
                            transform: [{ translateX: 0 }],
                        },
                    }),
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="receipt-outline" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="layanan"
                options={{
                    title: "Layanan",
                    lazy: false,
                    animation: "none",
                    sceneStyleInterpolator: () => ({
                        sceneStyle: {
                            opacity: 1,
                            transform: [{ translateX: 0 }],
                        },
                    }),
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="construct-outline" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="more"
                options={{
                    title: "More",
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="grid-outline" size={24} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
