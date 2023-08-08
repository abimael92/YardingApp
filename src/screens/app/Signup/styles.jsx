import { StyleSheet } from 'react-native';
import { colors } from '../../../utils/colors';

export const styles = StyleSheet.create({
    container: { padding: 24 },
    titleContainer: {
        marginVertical: 54
    },
    title: {
        fontSize: 40,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    innerTitle: {
        color: colors.orange,
        textDecorationLine: 'underline'
    }
});
