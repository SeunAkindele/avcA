import React from 'react';
import {StatusBar} from 'react-native';
import Navigation from './src/navigation';

const App = () => {
    return (
        <>
            <StatusBar barStyle={'dark-content'} />
            <Navigation />
        </>
    );
};

export default App;

// https://github.com/voximplant/android-sdk-demo/blob/master/app/src/main/java/com/voximplant/sdkdemo/SDKDemoApplication.java