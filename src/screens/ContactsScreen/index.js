import React, { useState, useEffect } from 'react';
import {View, FlatList, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import dummyContacts from '../../../assets/data/contacts.json';
import { useNavigation } from '@react-navigation/native';
import {Voximplant} from 'react-native-voximplant';
import messaging from "@react-native-firebase/messaging";

const ContactsScreen = () => {
    const navigation = useNavigation();
    const voximplant = Voximplant.getInstance();

    const [searchTerm, setSearchTerm] = useState('');
    const [filteredContacts, setFilteredContacts] = useState(dummyContacts);

    const msg = messaging();

    useEffect(() => {
        voximplant.on(Voximplant.ClientEvents.IncomingCall, (incomingCallEvent) => {
            navigation.navigate('IncomingCall', {call: incomingCallEvent.call});
        });

        return () => {
            voximplant.off(Voximplant.ClientEvents.IncomingCall);
        }
    }, []);

    useEffect(() => {
        const newContacts = dummyContacts.filter(contact => contact.user_display_name.toLowerCase().includes(searchTerm.toLowerCase()));
        setFilteredContacts(newContacts);
    }, [searchTerm]);

    const callUser = (user) => {
        navigation.navigate('Calling', {user});
    }

    const logout = async () => {
        await voximplant.disconnect();
        await unregisterPushToken();
        navigation.navigate("Login")
    }

    const unregisterPushToken = async () => {
        let token = await msg.getToken();;
        voximplant.unregisterPushNotificationsToken(token);
    }

    return (
        <View style={styles.page}>
            <TextInput value={searchTerm} style={styles.searchInput} onChangeText={setSearchTerm} placeholder='Search...' />
            <FlatList 
                data={filteredContacts}
                renderItem={({item}) => (
                    <Pressable onPress={() => callUser(item)}>
                        <Text style={styles.contactName}>{item.user_display_name}</Text>
                    </Pressable>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
            <Pressable onPress={logout}>
                <Text>Logout</Text>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    page: {
        padding: 15,
        backgroundColor: 'white',
        flex: 1
    },
    contactName: {
        fontSize: 16,
        marginVertical: 10,
    },
    separator: {
        width: '100%',
        height: 1,
        backgroundColor: '#f0f0f0',
    },
    searchInput: {
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 5,
    }
});

export default ContactsScreen;