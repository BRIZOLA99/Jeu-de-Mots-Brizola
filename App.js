import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Button, Text } from 'react-native';

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
  return grid;
};

const Grid = () => {
  const [selectedCell, setSelectedCell] = useState({ row: 0, col: 0 });
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0);
  const [grid, setGrid] = useState(generateEmptyGrid()); // Utilisation de la fonction generateEmptyGrid ici

  const words = [
    { id: 1, word: 'REACTA', clue: 'Framework JavaScript', x: 0, y: 0, across: true, background: 'lightblue', found: false },
    { id: 2, word: 'NATIVE', clue: 'Framework pour les applications mobiles', x: 0, y: 1, across: false, background: 'lightgreen', found: false },
    { id: 3, word: 'CROISE', clue: 'Type de jeu de mots', x: 1, y: 1, across: true, background: 'lightyellow', found: false },
    { id: 4, word: 'GRILLE', clue: 'Structure de jeu de mots', x: 1, y: 2, across: false, background: 'lightpink', found: false },
    { id: 5, word: 'JAVASCRIPT', clue: 'Langage de programmation', x: 1, y: 8, across: true, background: 'lightsalmon', found: false },
  ];

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
      if (!selectedWord.isUnused) { // Vérifier si le mot n'a pas déjà été trouvé
        setScore(score + 1); // Incrémenter le score si le mot n'a pas déjà été trouvé
        selectedWord.isUnused = true; // Marquer le mot comme trouvé
      }
      updateGrid(selectedWord, words.indexOf(selectedWord));
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
      newGrid[row][col].background = word.background; // Définir l'arrière-plan de la cellule
    }
    setGrid(newGrid);
    renderCluesInGrid();
  };

  // Fonction pour afficher les indices à côté de la première lettre de chaque mot
  const renderCluesInGrid = () => {
    words.forEach((word) => {
      const row = word.across ? word.y : word.y + 1;
      const col = word.across ? word.x + 1 : word.x;
      if (!word.found) {
        grid[row][col].value = `${word.id}.`;
      } else {
        for (let i = 0; i < word.word.length; i++) {
          const row = word.across ? word.y : word.y + i;
          const col = word.across ? word.x + i : word.x;
          grid[row][col].value = '';
        }
      }
    });
  };

  // Appeler la fonction pour afficher les indices dans la grille lors du montage du composant
  useEffect(() => {
    renderCluesInGrid();
  }, []);

  return (
    <View style={styles.container}>
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
      <View style={styles.cluesContainer}>
        <Text style={styles.cluesTitle}>Indices :</Text>
        {words.map(({ clue }, index) => (
          <Text key={index} style={styles.clue}>{`${index + 1}. ${clue}`}</Text>
        ))}
      </View>
      <TextInput
        style={styles.input}
        value={answer}
        onChangeText={handleInputChange}
        placeholder="Entrez votre réponse"
      />
      <Button title="Soumettre" onPress={checkAnswer} />
      <Text style={styles.message}>{message}</Text>
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
    cellStyles.push(styles.unusedCell); // Style pour les cellules inutilisées
  }
  // Ajouter l'arrière-plan dynamique à la cellule
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
    backgroundColor: 'black', // Style pour les cellules inutilisées
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
    borderWidth: 1,
    marginBottom: 10,
    padding: 5,
    width: 200,
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
