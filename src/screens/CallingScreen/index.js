import React, {useEffect, useState, useRef} from "react";
import {View, Text, StyleSheet, Pressable, PermissionsAndroid, Alert, Platform} from 'react-native';
import CallActionBox from "../../components/CallActionBox";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from "@react-navigation/native";
import {Voximplant} from 'react-native-voximplant';

const permissions = [
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    PermissionsAndroid.PERMISSIONS.CAMERA
];

const CallingScreen = () => {
    const [permissionGranted, setPermissionGranted]=useState(false);
    const [callStatus, setCallStatus] = useState('Calling...');
    const [localVideoStreamId,setLocalVideoStreamId] = useState('');
    const [remoteVideoStreamId,setRemoteVideoStreamId] = useState('');

    // Calling features
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [reverseCamera, setReverseCamera] = useState(false);
    const [hold, setHold] = useState(false);
    const [duration,setDuration] = useState(0);

    const navigation = useNavigation();
    const route = useRoute();

    const {user, call: incomingCall, isIncomingCall} = route ?.params;

    const voximplant = Voximplant.getInstance();
    // const AudioDeviceManager = Voximplant.Hardware.AudioDeviceManager.getInstance();
    const cameraType = Voximplant.Hardware.CameraType;
    const cameraManager = Voximplant.Hardware.CameraManager.getInstance();
    
    const call = useRef(incomingCall);
    let intervalRef = useRef(0);
    const endpoint = useRef(null);

    const goBack = () => {
        navigation.goBack();
    }

    useEffect(() => {
        const getPermissions = async () => {
            const granted = await PermissionsAndroid.requestMultiple(permissions);
            const recordAudioGranted =
            granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] = 'granted';
            const cameraGranted =
            granted[PermissionsAndroid.PERMISSIONS.CAMERA] = 'granted';
            if (!cameraGranted | !recordAudioGranted) {
            Alert.alert('Permissions not granted');
            } else {
            setPermissionGranted(true);
            }
        }

        if(Platform.OS === 'android') {
            getPermissions();
        }else {
            setPermissionGranted(true);
        }
    }, []);

    useEffect(() => {
        if(!permissionGranted) {
            return;
        }

        const callSettings = {
            video: {
                sendVideo: true,
                receiveVideo: true
            }
        }
        
        const makeCall = async () => {
            call.current = await voximplant.call(user.user_name, callSettings);
            subscribeToCallEvents();
        }

        const answerCall = async () => {
            subscribeToCallEvents();
            endpoint.current = call.current.getEndpoints()[0];
            subscribeToEndpointEvent();
            call.current.answer(callSettings);
            
        }

        const subscribeToCallEvents = () => {
            call.current.on(Voximplant.CallEvents.Failed, (callEvent) => {
                showError(callEvent.reason);
            });

            call.current.on(Voximplant.CallEvents.ProgressToneStart, (callEvent) => {
                setCallStatus("Ringing...")
            });

            call.current.on(Voximplant.CallEvents.Connected, (callEvent) => {
                setCallStatus("Connected")
            });

            call.current.on(Voximplant.CallEvents.Disconnected, (callEvent) => {
                navigation.navigate('Contacts');
            });

            call.current.on(
                Voximplant.CallEvents.LocalVideoStreamAdded, callEvent => {
                    setLocalVideoStreamId(callEvent.videoStream.id);
                },
            );

            call.current.on(Voximplant.CallEvents.EndpointAdded, callEvent => {
                endpoint.current = callEvent.endpoint;
                subscribeToEndpointEvent();
            });

            
        }

        const subscribeToEndpointEvent = async () => {
            endpoint.current.on(Voximplant.EndpointEvents.RemoteVideoStreamAdded, endpointEvent => {
                setRemoteVideoStreamId(endpointEvent.videoStream.id);
            });
        }

        const showError = (reason) => {
            Alert.alert(
                "Call failed", `Reason: ${reason}`, [
                    {
                        text: 'Ok',
                        onPress: navigation.navigate('Contacts')
                    }
                ]
            );
        }

        if(isIncomingCall) {
            answerCall();
        } else {
            makeCall();
        }
        

        return () => {
            call.current.off(Voximplant.CallEvents.Failed);
            call.current.off(Voximplant.CallEvents.ProgressToneStart);
            call.current.off(Voximplant.CallEvents.Connected);
            call.current.off(Voximplant.CallEvents.Disconnected);
        }
    }, [permissionGranted]);

    useEffect(() => {
        intervalRef.current = setInterval(async () => {
            const time = await call.current.getDuration();
            if (duration === time || time === 0) {
                return;
            }
            setDuration(time);
        }, 300);
        
        return () => {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        };
    }, []);

    const onHangupPress = () => {
        console.log({duration});
        call.current.hangup();
    }

    const onToggleMicrophone = () => {
        isMicOn ? call.current.sendAudio(false) : call.current.sendAudio(true);
        setIsMicOn(!isMicOn);
    }

    const onToggleCamera = () => {
        isCameraOn ? call.current.sendVideo(false) : call.current.sendVideo(true);
        setIsCameraOn(!isCameraOn);
        setLocalVideoStreamId(null);
    }

    const onReverseCamera = () => {
        // reverseCamera ? cameraManager.switchCamera(cameraType.FRONT) : cameraManager.switchCamera(cameraType.BACK);

        // switch video feed

        // if(reverseCamera) {
        //     setLocalVideoStreamId(remoteVideoStreamId);
        //     setRemoteVideoStreamId(localVideoStreamId);
        // } else {
        //     setLocalVideoStreamId(remoteVideoStreamId);
        //     setRemoteVideoStreamId(localVideoStreamId);
        // }
          
        // setReverseCamera(!reverseCamera);
    }

    const onHold = () => {
        hold ? call.current.hold(false) : call.current.hold(true);
        setHold(!hold);
    }
    
    return (
        <View style={styles.page}>
            <Pressable onPress={goBack} style={styles.backButton}>
                <Ionicons name="chevron-back" color="white" size={20} />
            </Pressable>
            
            <Voximplant.VideoView 
                videoStreamId={remoteVideoStreamId}
                style={styles.remoteVideo}
            />
            {
                localVideoStreamId ?
                <Voximplant.VideoView 
                            videoStreamId={localVideoStreamId}
                            showOnTop={true}
                            style={styles.localVideo}
                />  :
                <Voximplant.VideoView 
                    videoStreamId={localVideoStreamId}
                    showOnTop={true}
                    style={styles.localVideo}
                />
            }

            <View style={styles.cameraPreview}>
                <Text style={styles.name}>{user?.user_display_name}</Text>
                <Text style={styles.phoneNumber}>{duration}</Text>
            </View>
            <CallActionBox onHangupPress={onHangupPress} onToggleMicrophone={onToggleMicrophone} isMicOn={isMicOn} isCameraOn={isCameraOn} onToggleCamera={onToggleCamera} onReverseCamera={onReverseCamera} reverseCamera={reverseCamera} />
        </View>
    )
};

const styles = StyleSheet.create({
    page: {
        height: '100%',
        backgroundColor: '#7b4e80',
    },
    cameraPreview: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 10,
        paddingHorizontal: 10
    },
    localVideo: {
        width: 100,
        height: 150,
        backgroundColor: '#000',
        position: 'absolute',
        right: 10,
        top: 100,
        borderRadius: 10,

    },
    remoteVideo: {
        height: '100%',
        backgroundColor: '#7b4e80',
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
        
    },
    name: {
        fontSize: 30,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 50,
        marginBottom: 15
    },
    phoneNumber: {
        fontSize: 20,
        color: 'white'
    },
    buttonsContainer: {
        backgroundColor: '#333333',
        padding: 20,
        paddingBottom: 40,
        borderTopLeftRadius: 15,
        borderTopRightRadius:15,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    iconButton: {
        backgroundColor: '#4a4a4a',
        padding: 15,
        borderRadius: 50
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 10,
        zIndex: 10
    }
});

export default CallingScreen;