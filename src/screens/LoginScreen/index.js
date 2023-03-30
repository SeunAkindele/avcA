import { useNavigation } from "@react-navigation/native";
import React, {useState, useEffect} from "react";
import {View, TextInput, StyleSheet, Pressable, Text, Alert} from 'react-native';
import {Voximplant} from 'react-native-voximplant';
import { ACC_NAME, APP_NAME } from "../../constants";
import messaging from "@react-native-firebase/messaging";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginScreen = () => {
    const[username, setUsername] = useState('');
    const[passsword, setPassword] = useState('');

    const voximplant = Voximplant.getInstance();
    const navigation = useNavigation();
    const msg = messaging();

    useEffect(() => {
               
        const connect = async () => {
            const status = await voximplant.getClientState();
            if(status === Voximplant.ClientState.DISCONNECTED) {
                await voximplant.connect();
            } else if(status === Voximplant.ClientState.LOGGED_IN) {
                redirectHome();
            }
        }

        connect();
        pushBackgroundHandler();
        pushMessaging();
    }, []);

    const pushManager = async () => {
        return await msg.getToken();
    }

    const pushMessaging = async () => {
        await msg.onMessage(async (remoteMessage) => {
            console.log(
                `PushManager(android): onMessage: ${remoteMessage.data}`
            );
    
            await pushNotificationReceived(remoteMessage.data);
        });
    }

    const refreshToken = async () => {
        let token = await msg.onTokenRefresh(remoteToken => remoteToken);   
        console.log(`PushManager(android): Refresh token: ${token}`); 
        return token;
    }

    const pushBackgroundHandler = async () => {
        await msg.setBackgroundMessageHandler(async(remoteMessage) => {
            console.log(
                `PushManager(android): background notification: ${
                  remoteMessage
                }`,
            );
    
            await pushNotificationReceived(remoteMessage.data);    
        });      
    }

    const pushNotificationReceived = async (notification) => {
        await tokenSignin();
        voximplant.handlePushNotification(notification);
    }
    
    const signin = async () => {
        try {
            const user = `${username}@${APP_NAME}.${ACC_NAME}.voximplant.com`;
            const authResult = await voximplant.login(user, passsword);
            processPushToken(authResult);
            redirectHome();
        } catch(e) {
            console.log(e);
            Alert.alert(e.name, `Error code: ${e.code}`);
        }
    };

    const tokenSignin = async () => {
        console.log("push notification login");
        
        try {            
            const username = await AsyncStorage.getItem('username');
            const accessToken = await AsyncStorage.getItem('accessToken');
            const user = `${username}@${APP_NAME}.${ACC_NAME}.voximplant.com`;
            
            const authResult = await voximplant.loginWithToken(user, accessToken);
            processPushToken(authResult);
            redirectHome();
        } catch(e) {
            console.log(e);
            Alert.alert(e.name, `Error code: ${e.code}`);
        }
    };

    const registerPushToken = async () => {
        let token = await pushManager();
        voximplant.registerPushNotificationsToken(token);
    }

    const processPushToken = async (authResult) => {
        const loginTokens = authResult.tokens;
        
        if (loginTokens !== null) {
            await AsyncStorage.setItem('accessToken', loginTokens.accessToken);
            await AsyncStorage.setItem('refreshToken', loginTokens.refreshToken);
            await AsyncStorage.setItem('accessExpire', loginTokens.accessExpire.toString());
            await AsyncStorage.setItem('refreshExpire', loginTokens.refreshExpire.toString());
            await AsyncStorage.setItem('username', username);
            
            registerPushToken();
        } else {
            console.error('LoginSuccessful: login tokens are invalid');
        }
    }

    const redirectHome = () => {
        navigation.reset({
            index: 0,
            routes: [
                {
                    name: 'Contacts'
                }
            ]
        });
    }

    return (
        <View style={styles.page}>
            <TextInput 
                placeholder="username" 
                style={styles.input} 
                onChangeText={setUsername}
                value={username}
                autoCapitalize="none"
            />
            <TextInput 
                placeholder="password" 
                style={styles.input}
                onChangeText={setPassword}
                value={passsword}
                secureTextEntry
            />

            <Pressable style={styles.button} onPress={signin}>
                <Text>Sign in</Text>
            </Pressable>
        </View>
    )
};

const styles = StyleSheet.create({
    page: {
        padding: 10,
        alignItems: 'stretch',
        flex: 1,
        justifyContent: 'center'
    },
    input: {
        backgroundColor: 'white',
        padding: 10,
        marginVertical: 10,
        borderRadius: 5
    },
    button: {
        backgroundColor: 'dodgerblue',
        padding: 10,
        marginVertical: 10,
        borderRadius: 5,
        alignItems: 'center'

    }
});

export default LoginScreen;