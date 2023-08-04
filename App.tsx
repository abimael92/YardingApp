/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

// import {Chair as BlackChair} from './Chair';
// import Table from './Table';
import Splash from './src/screens/auth/Splash';

function App(): JSX.Element {
    // const [theme, setTheme] = useState('light');

    return (
        <SafeAreaView>
            {/* <Text style={styles.themeHeader} onPress={() => setTheme('dark')}>
        Make Theme Dark
      </Text> */}
            <Splash />
            {/* <View>
        <BlackChair theme={theme} />
        <Table />
      </View> */}
        </SafeAreaView>
    );
}

// const styles = StyleSheet.create({
//   themeHeader: {margin: 16, fontSize: 16, backgroundColor: 'lightgrey'},
// });

export default App;
