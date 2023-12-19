import * as React from 'react';
import { Button, Text, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

export default HomeScreen = ({navigation}) => {
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={styles.text}> Rhystic Buddy </Text>
            <Button
                title="Start Game"
                onPress={() => navigation.navigate('Game')}
            />
            {/* <Button
                title="Start Guess"
                onPress={() => navigation.navigate('Guess')}
            /> */}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        position: 'absolute',
        top: 125,
        fontSize: 36,
    }
  });
  