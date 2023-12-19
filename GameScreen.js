import React, { useState, useEffect, useCallback } from 'react';
import { Image, Text, View, StyleSheet, Dimensions, Animated, PanResponder, FlatListComponent } from 'react-native';
import { NavigationContainer, useIsFocused, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { render } from 'react-dom';

export default GameScreen = ({navigation}) => {
    // Data
    const SERVER_URL = "https://magikinator-d04800de7ba6.herokuapp.com/guess"
    const SCRYFALL_IMG_URL = "https://api.scryfall.com/cards/named?format=image&fuzzy="
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [entropy, setEntropy] = useState(null);
    const [bestQuestion, setBestQuestion] = useState("Does your card reference its own name in its bottom text?")
    const [guessedCard, setGuessedCard] = useState("Fury Sliver")
    const [bestCards, setBestCards] = useState([null, null, null, null, null])
    const [guessedCardImg, setGuessedCardImg] = useState("/garfield.png")
    const [loading, setLoading] = useState(true)
    const [errorFound, setError] = useState(false)
    const [symbolMap, setSymbolMap] = useState({})

    const Cards = [
      { id: "current_card", uri: SCRYFALL_IMG_URL + "Fury Sliver"},
      { id: "if_yes", uri: SCRYFALL_IMG_URL + "Treasure"},
    ]

    // UI
    const SCREEN_HEIGHT = Dimensions.get('window').height
    const SCREEN_WIDTH = Dimensions.get('window').width
    const [currentIndex, setCurrentIndex] = useState(0)
    
    const position = React.useRef(new Animated.ValueXY).current;

    const rotate = React.useRef(position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: ['-10deg', '0deg', '10deg'],
      extrapolate: 'clamp'
    })).current;

    const rotateAndTranslate = React.useRef({
      transform: [{
        rotate: rotate
      },
      ...position.getTranslateTransform()
      ]
    }).current;

    const likeOpacity = React.useRef(position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [0, 0, 1],
      extrapolate: 'clamp'
    })).current;

    const dislikeOpacity = React.useRef(position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [1, 0, 0],
      extrapolate: 'clamp'
    })).current;

    const panResponder = React.useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: (evt, gestureState) => true,
        onPanResponderMove: Animated.event(
          [
            null,
            {
              dx: position.x, // x,y are Animated.Value
              dy: position.y,
            },
          ],
          { useNativeDriver: false }),
        onPanResponderRelease: (evt, gestureState) => {
          const direction = Math.sign(gestureState.dx);
          const isSwipedOffScreen = Math.abs(gestureState.dx) > 100;
          console.log(direction)
          if (isSwipedOffScreen) {
            console.log("SWIPED OFF SCREEN")
            Animated.spring(position, {
              toValue: {
                x: (SCREEN_WIDTH + 100) * direction,
                y: gestureState.dy },
                useNativeDriver: true
            }).start(() => {
              setCurrentIndex(currentIndex + 1)
              position.setValue({ x: 0, y: 0 })
            })
          } else {
            Animated.spring(position, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: true,
              friction: 4
            }).start()
          }
        }
      })
    ).current;

    // useFocusEffect(
    //     React.useCallback(() => {
    //         console.log("Called!")
    //         setLoading(true)
    //         const fetchFirstCard = async () => {
    //             try {
    //                 await fetch(SERVER_URL, {
    //                     method: 'GET',
    //                     headers: {
    //                         'Content-type': 'application/json; charset=UTF-8',
    //                         'Access-Control-Allow-Origin': "*",
    //                         "Access-Control-Allow-Headers": "Content-Type"
    //                     }
    //                 })
    //                     .then((response) => response.json())
    //                     .then((data) => {
    //                         let bestQ = data['bestQuestion']
    //                         let cardGuessedByServer = data['guessedCard']
    //                         setBestQuestion(bestQ)
    //                         setGuessedCard(cardGuessedByServer)
    //                         setQuestions([...questions, bestQ])
    //                         setLoading(false)
    //                         console.log("Response found")
    //                     })
    //             } catch (err) {
    //                 setError(true)
    //             };
    //         }
            
    //         fetchFirstCard();

    //     }, [])
    // );

    // useEffect(() => {
    // }, [guessedCardImg])

    // const answerQuestion = async (answer) => {
    //     setLoading(true)
    //     await fetch(SERVER_URL, {
    //         method: 'POST',
    //         body: JSON.stringify({
    //             "Questions": questions,
    //             "Answers": [...answers, answer],
    //             "Entropy": entropy
    //         }),
    //         headers: {
    //             'Content-type': 'application/json; charset=UTF-8',
    //             'Access-Control-Allow-Origin': "*",
    //             "Access-Control-Allow-Headers": "Content-Type"
    //         }
    //     })
    //         .then((response) => response.json())
    //         .then((data) => {
    //             let bestQ = data['bestQuestion']
    //             let cardGuessedByServer = data['guessedCard']
    //             console.log(cardGuessedByServer)
    //             let entropyVector = JSON.parse(data['entropyValue'])
    //             let bestCards = data['bestCards']
    //             // let bestCards = JSON.parse(data['bestCards'])
    //             setBestQuestion(bestQ)
    //             setGuessedCard(cardGuessedByServer)
    //             setEntropy(entropyVector)
    //             setBestCards(bestCards)
    //             setQuestions([...questions, bestQ])
    //             setAnswers([...answers, answer])
    //             setLoading(false)
    //         })
    //         .catch((err) => {
    //             console.log(err.message)
    //         })
    // }

    const renderCards = () => {
        return Cards.map((item, i) => {
          if (i < currentIndex) {
            return null;
          }

          else if (i == currentIndex) {
            return (
              <Animated.View
                  {...panResponder.panHandlers}
                  key={i}
                  style={[rotateAndTranslate,
                  {
                    top: 100,
                    height: SCREEN_HEIGHT - 325,
                    width: SCREEN_WIDTH,
                    padding: 10,
                    position: 'absolute'
                  }
                ]}
              >
                <Animated.View 
                  style={{ 
                    opacity: likeOpacity,
                    transform: [{ rotate: '-30deg' }],
                    position: 'absolute',
                    top: 50,
                    left: 40,
                    zIndex: 1000 
                  }}
                >
                <Text style={{ 
                  borderWidth: 1,
                  borderColor: 'green', 
                  color: 'green', 
                  fontSize: 50, 
                  fontWeight: '800', 
                  padding: 10 
                }}> YES </Text>
              </Animated.View>
              <Animated.View 
                  style={{ 
                    opacity: dislikeOpacity,
                    transform: [{ rotate: '30deg' }],
                    position: 'absolute',
                    top: 50,
                    right: 40,
                    zIndex: 1000 
                  }}
                >
                <Text style={{ 
                  borderWidth: 1,
                  borderColor: 'red', 
                  color: 'red', 
                  fontSize: 50, 
                  fontWeight: '800', 
                  padding: 10 
                }}> NO </Text>
              </Animated.View>
                <Image
                  style={{
                    flex: 1,
                    height: null,
                    width: null,
                    resizeMode: "cover",
                    borderRadius: 20
                  }}
                  source={{uri: item.uri}}
                />
              </Animated.View>
            );
          } else {
            return (
              <Animated.View
                  key={i}
                  style={{
                    top: 100,
                    height: SCREEN_HEIGHT - 325,
                    width: SCREEN_WIDTH,
                    padding: 10,
                    position: 'absolute'
                }}
              >
                <Image
                  style={{
                    flex: 1,
                    height: null,
                    width: null,
                    resizeMode: "cover",
                    borderRadius: 20
                  }}
                  source={{uri: item.uri}}
                />
              </Animated.View>
            );
          }
     }).reverse();
    }

    return (
        <View style={{ flex: 1 }}>
            <View style={{ height: 60 }}>
              <Text style={styles.question}>
                {bestQuestion}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
                {renderCards()}
            </View>
            <View style={{ height: 60 }}>
            </View>
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
    question: {
        position: 'absolute',
        width: '100%',
        top: 30,
        textAlign: 'center',
        fontSize: 20,
    },
    image: {
        position: 'absolute',
        top: 50,
        width: 300,
        height: 425,
        resizeMode: 'stretch'
    }
  });
  