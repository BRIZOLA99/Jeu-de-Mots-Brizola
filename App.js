import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Button, Text, Animated } from 'react-native';

// Définir la fonction generateEmptyGrid avant le composant Grid
const generateEmptyGrid = () => {
  const grid = [];
  for (let i = 0; i < 9; i++) {
    const row = [];
    for (let j = 0; j < 9; j++) {
      row.push({ value: '', isBlack: false, isCorrect: false, background: 'transparent', isUnused: false });
    }
    grid.push(row);
  }

  // Ajouter les indices dans la grille
  grid[0][0].value = '1.';
  grid[1][0].value = '2.';
  grid[2][1].value = '3.';
  grid[3][1].value = '4.';
  grid[8][1].value = '5.';

  return grid;
};

const Grid = () => {
  const [selectedCell, setSelectedCell] = useState({ row: 0, col: 0 });
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0);
  const [grid, setGrid] = useState(generateEmptyGrid()); // Utilisation de la fonction generateEmptyGrid ici
  const [slideAnim] = useState(new Animated.Value(0)); // Nouvel état pour l'animation

  // Définir les mots à trouver
  const [words, setWords] = useState([
    { id: 1, word: 'REACTA', clue: 'Framework JavaScript', x: 0, y: 0, across: true, background: 'lightblue', isFound: false },
    { id: 2, word: 'NATIVE', clue: 'Framework pour les applications mobiles', x: 0, y: 1, across: false, background: 'lightgreen', isFound: false },
    { id: 3, word: 'CROISE', clue: 'Type de jeu de mots', x: 1, y: 1, across: true, background: 'lightyellow', isFound: false },
    { id: 4, word: 'GRILLE', clue: 'Structure de jeu de mots', x: 1, y: 2, across: false, background: 'lightpink', isFound: false },
    { id: 5, word: 'JAVASCRIPT', clue: 'Langage de programmation', x: 1, y: 8, across: true, background: 'lightsalmon', isFound: false },
  ]);

  // Fonction appelée lorsque l'utilisateur change la valeur de la case
  const handleInputChange = (text) => {
    setAnswer(text.toUpperCase());
  };

  // Fonction appelée lorsqu'une case est sélectionnée
  const handleCellSelection = (row, col) => {
    setSelectedCell({ row, col });
  };

  // Fonction appelée lorsque l'utilisateur soumet sa réponse
  const checkAnswer = () => {
    const selectedWord = words.find(word => 
      (word.across && word.y === selectedCell.row && word.x <= selectedCell.col && selectedCell.col < word.x + word.word.length) ||
      (!word.across && word.x === selectedCell.col && word.y <= selectedCell.row && selectedCell.row < word.y + word.word.length)
    );
    if (selectedWord && answer === selectedWord.word) {
      setMessage('Bonne réponse!');
      if (!selectedWord.isFound) {
        setScore(score + 1);
        selectedWord.isFound = true;
        setWords([...words]);
      }
      updateGrid(selectedWord, words.indexOf(selectedWord));
      slideWord(); // Appeler la fonction pour lancer l'animation
    } else {
      setMessage('Mauvaise réponse!');
    }
  };

  // Fonction pour mettre à jour la grille avec la réponse correcte
  const updateGrid = (word, index) => {
    const newGrid = [...grid];
    for (let i = 0; i < word.word.length; i++) {
      const row = word.across ? word.y : word.y + i;
      const col = word.across ? word.x + i : word.x;
      newGrid[row][col].value = i === 0 ? `${index + 1}.${word.word[i]}` : word.word[i];
      newGrid[row][col].isCorrect = true;
      newGrid[row][col].background = word.background;
    }
    setGrid(newGrid);
  };

  // Fonction pour animer le mot entré
  const slideWord = () => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 500, // Durée de l'animation en millisecondes
      useNativeDriver: false,
    }).start(() => {
      // Réinitialiser l'animation après qu'elle soit terminée
      slideAnim.setValue(0);
      // Réinitialiser la réponse
      setAnswer('');
    });
  };

  // Fonction pour afficher la grille
  const renderGrid = () => {
    return (
      <View style={styles.grid}>
        {grid.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map(({ value, isBlack, isCorrect, background, isUnused }, colIndex) => (
              <Cell
                key={colIndex}
                value={value}
                isBlack={isBlack}
                isCorrect={isCorrect}
                background={background} // Passer l'arrière-plan de la cellule comme une propriété
                isSelected={rowIndex === selectedCell.row && colIndex === selectedCell.col}
                isUnused={isUnused} // Passer l'information sur l'utilisation de la cellule
                onSelect={() => handleCellSelection(rowIndex, colIndex)}
              />
            ))}
          </View>
        ))}
      </View>
    );
  };

  // Fonction pour afficher les indices des mots à trouver
  const renderClues = () => {
    return (
      <View style={styles.cluesContainer}>
        <Text style={styles.cluesTitle}>Indices :</Text>
        {words.map(({ clue, isFound }, index) => (
         <Text key={index} style={styles.clue}>{isFound ? <Text style={{textDecorationLine: 'line-through'}}>{`${index + 1}. ${clue}`}</Text> : `${index + 1}. ${clue}`}</Text>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderGrid()}
      {renderClues()}
      <Animated.Text
        style={[
          styles.input,
          {
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -100], // Réglez la hauteur de déplacement de votre choix
                }),
              },
            ],
          },
        ]}
      >
        {answer}
      </Animated.Text>
      <TextInput
        style={styles.inputHidden} // Style caché pour la saisie de texte
        value={answer}
        onChangeText={handleInputChange}
        placeholder="Entrez votre réponse"
      />
      <Button title="Soumettre" onPress={checkAnswer} />
      <Text style={[styles.message, message === 'Bonne réponse!' ? { color: 'green' } : { color: 'red' }]}>{message}</Text>
      <Text style={styles.score}>Score: {score}</Text>
    </View>
  );
};

const Cell = ({ value, isBlack, isCorrect, background, isSelected, isUnused, onSelect }) => {
  const cellStyles = [styles.cell];
  if (isBlack) {
    cellStyles.push(styles.blackCell);
  } else if (isCorrect) {
    cellStyles.push(styles.correctCell);
  } else if (isSelected) {
    cellStyles.push(styles.selectedCell);
  } else if (isUnused) {
    cellStyles.push(styles.unusedCell);
  }
  cellStyles.push({ backgroundColor: background });
  return (
    <Text style={cellStyles} onPress={onSelect}>
      {value}
    </Text>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  grid: {
    borderWidth: 1,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    borderWidth: 1,
    width: 30,
    height: 30,
    textAlign: 'center',
    fontSize: 18,
  },
  blackCell: {
    backgroundColor: 'black',
    color: 'white',
  },
  correctCell: {
    backgroundColor: 'lightgreen',
  },
  selectedCell: {
    backgroundColor: 'lightblue',
  },
  unusedCell: {
    backgroundColor: 'black',
  },
  cluesContainer: {
    marginBottom: 20,
  },
  cluesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  clue: {
    marginBottom: 5,
  },
  input: {
    position: 'absolute', // Position absolue pour l'animation
    borderWidth: 1,
    marginBottom: 10,
    padding: 5,
    width: 200,
  },
  inputHidden: {
    position: 'absolute', // Position absolue pour cacher la saisie de texte
    opacity: 0,
  },
  message: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
  score: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Grid;
