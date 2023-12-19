import React, { useRef, useEffect, useCallback } from 'react';
import { Animated, Text, View, PanResponder, StyleSheet } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

export const GuessScreen = () => {
    const bounce = useRef(new Animated.ValueXY({x: 10, y: 450})).current
    const move = () => {
        Animated.spring(bounce, {
            toValue: {x: 250, y: 10},
            useNativeDriver: true,
        }).start();
    };

    const pan = useRef(new Animated.ValueXY()).current;
    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: Animated.event([null, {dx: pan.x, dy: pan.y}]),
            onPanResponderRelease: () => {
                pan.extractOffset();
            }
        })
    ).current;

    return (
        <View>
            <Text> Drag this box! </Text>
            <Animated.View 
                style={{
                    transform: [{translateX: pan.x}, {translateY: pan.y}] 
                }}
                {...panResponder.panHandlers}
                >
                <TouchableWithoutFeedback onPress={move}>
                    <Text> Press </Text>
                </TouchableWithoutFeedback>
            </Animated.View>
        </View>
    );
};

export const SwipeCard = ({ children, items, setItems, renderActionBar, onSwipeUser }) => {
    const { height } = Dimensions.get('screen');

    const swipe = useRef(new Animated.ValueXY()).current;
    const titleSign = useRef(new Animated.Value(1)).current;

    const removeTopCard = useCallback(() => {
        setItems(prevState => prevState.slice(1));
        swipe.setValue({ x: 0, y: 0});
    }, [swipe, setItems])

    const rotate = Animated.multiply(swipe.x, titleSign).interpolate({
        inputRange: [-100, 0, 100],
        outputRange: ['8deg', '0deg', '-8deg']
    });

    const animatedCardStyle = {
        transform: [...swipe.getTranslateTransform(), {rotate}]
    }

    const handleChoice = useCallback(
        (direction) => {
            Animated.timing(swipe.x, {
                toValue: direction * 500,
                duration: 400,
                useNativeDriver: true,
            }).start(removeTopCard);
        },
        [removeTopCard, swipe.x]
    )

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (_, {dx, dy, y0}) => {
                swipe.setValue({x: dx, y: dy});
                titleSign.setValue(y0 > (height * 0.9) / 2 ? 1 : -1);
            },
            onPanResponderRelease: (_, {dx, dy}) => {
                const direction = Math.sign(dx);
                const isSwipedOffScreen = Math.abs(dx) > 100;

                if (isSwipedOffScreen) {
                    Animated.timing(swipe, {
                        duration: 100,
                        toValue: {
                            x: direction * 500,
                            y: dy,
                        },
                        useNativeDriver: true,
                    }).start(removeTopCard);
                        return;
                    }

                    Animated.spring(swipe, {
                        toValue: {
                            x: 0, 
                            y: 0,
                        },
                        useNativeDriver: true,
                        friction: 5,
                    }).start()
                }
            })
        ).current;

    return(
        <View>
            <View>
                {items
                    .map((item, index) => {
                        <Animated.View
                            key={index}
                            style={[index == 0 ? animatedCardStyle : {}]}
                            {...(index === 0 ? panResponder.panHandlers : {})}>
                            {children(item, swipe, index === 0)}
                        </Animated.View>
                    })
                    .reverse()}
            </View>
            {renderActionBar(handleChoice)}
        </View>
    )
}

const SwipeCardStyleSheet = StyleSheet.create({
    container: {flex: 1, alignItems: 'center', top: -300},
})