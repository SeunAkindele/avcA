import React, {useState} from 'react';
import {View, StyleSheet, Pressable} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const CallActionBox = ({onHangupPress, onToggleMicrophone, isMicOn, onToggleCamera, isCameraOn,onReverseCamera, reverseCamera}) => {
    
    return (
        <View style={styles.buttonsContainer}>
            <Pressable onPress={onReverseCamera} style={styles.iconButton}>
                <Ionicons name={reverseCamera ? "ios-camera-reverse" : "ios-camera"} size={30} color={'white'} />
            </Pressable>
            <Pressable onPress={onToggleCamera} style={styles.iconButton}>
                <MaterialIcons name={isCameraOn ? "camera" : "camera-off"} size={30} color={'white'} />
            </Pressable>
            <Pressable onPress={onToggleMicrophone} style={styles.iconButton}>
                <MaterialIcons name={isMicOn ? "microphone" : "microphone-off"} size={30} color={'white'} />
            </Pressable>
            <Pressable onPress={onHangupPress} style={[styles.iconButton, {backgroundColor: 'red'}]}>
                <MaterialIcons name="phone-hangup" size={30} color={'white'} />
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    buttonsContainer: {
        backgroundColor: '#333333',
        padding: 20,
        paddingBottom: 40,
        borderTopLeftRadius: 15,
        borderTopRightRadius:15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 'auto'
    },
    iconButton: {
        backgroundColor: '#4a4a4a',
        padding: 15,
        borderRadius: 50
    }
});

export default CallActionBox;