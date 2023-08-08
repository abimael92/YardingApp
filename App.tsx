/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

// import {Chair as BlackChair} from './Chair';
// import Table from './Table';
import Splash from './src/screens/auth/Splash';
import Signup from './src/screens/app/Signup';

function App(): JSX.Element {
    return (
        <SafeAreaView>
            {/* <Splash /> */}
            <Signup />
        </SafeAreaView>
    );
}

export default App;
