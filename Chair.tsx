/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { Text } from 'react-native';

export const Chair = (props: { theme: any }) => {
    const { theme } = props;
    const [isBig, setIsBig] = useState(false);

    console.log('isBig: ', isBig);

    const changeState = () => {
        setIsBig(currentState => !currentState);
    };

    return (
        <Text
            style={{
                fontSize: isBig ? 24 : 14,
                color: theme === 'dark' ? 'grey' : 'black'
            }}
            onPress={changeState}>
            This is a Chair
        </Text>
    );
};

// export default Chair;
