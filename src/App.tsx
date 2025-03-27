import React, { useState, useCallback, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { Brain } from 'lucide-react';
import { getAIMove } from './lib/gemini';

function App() {
  const [game, setGame] = useState(new Chess());
  const [isThinking, setIsThinking] = useState(false);

  const makeAIMove = useCallback(async () => {
    if (game.isGameOver() || isThinking) return;

    setIsThinking(true);
    try {
      const suggestedMoves = await getAIMove(game.fen());
      const newGame = new Chess(game.fen());
      
      // Try each suggested move until we find a valid one
      let moveSuccessful = false;
      for (const moveStr of suggestedMoves) {
        try {
          const move = newGame.move(moveStr, { sloppy: true });
          if (move) {
            setGame(newGame);
            moveSuccessful = true;
            break;
          }
        } catch (moveError) {
          console.log('Invalid move:', moveStr);
          continue;
        }
      }

      // If no suggested moves worked, make a random legal move
      if (!moveSuccessful) {
        const moves = game.moves();
        if (moves.length > 0) {
          const randomMove = moves[Math.floor(Math.random() * moves.length)];
          newGame.move(randomMove);
          setGame(newGame);
        }
      }
    } catch (error) {
      console.error('AI move error:', error);
      // Fallback to random move on error
      const moves = game.moves();
      if (moves.length > 0) {
        const newGame = new Chess(game.fen());
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        newGame.move(randomMove);
        setGame(newGame);
      }
    } finally {
      setIsThinking(false);
    }
  }, [game, isThinking]);

  function onDrop(sourceSquare: string, targetSquare: string) {
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      });

      if (move === null) return false;
      
      setGame(new Chess(game.fen()));
      
      // Trigger AI move after player's move
      setTimeout(makeAIMove, 300);
      return true;
    } catch (error) {
      return false;
    }
  }

  const gameStatus = () => {
    if (game.isCheckmate()) return "Checkmate!";
    if (game.isDraw()) return "Draw!";
    if (game.isStalemate()) return "Stalemate!";
    if (game.isThreefoldRepetition()) return "Draw by repetition!";
    if (game.isInsufficientMaterial()) return "Draw by insufficient material!";
    return game.turn() === 'w' ? "Your turn" : "AI is thinking...";
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-2xl">
        <div className="flex items-center mb-6 space-x-3">
          <Brain className="w-8 h-8 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-800">Chess vs Gemini AI</h1>
        </div>
        
        <div className="w-[480px] h-[480px] relative">
          <Chessboard
            position={game.fen()}
            onPieceDrop={onDrop}
            customBoardStyle={{
              borderRadius: '4px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)',
            }}
            customDarkSquareStyle={{ backgroundColor: '#769656' }}
            customLightSquareStyle={{ backgroundColor: '#eeeed2' }}
          />
        </div>

        <div className="mt-6 text-center">
          <p className="text-lg font-semibold text-gray-700">
            {gameStatus()}
          </p>
          {game.isGameOver() && (
            <button
              onClick={() => setGame(new Chess())}
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              New Game
            </button>
          )}
        </div>
      </div>

      <a 
        target="_blank" 
        href="https://jam.pieter.com" 
        style={{
          fontFamily: 'system-ui, sans-serif',
          position: 'fixed',
          bottom: '-1px',
          right: '-1px',
          padding: '7px',
          fontSize: '14px',
          fontWeight: 'bold',
          background: '#fff',
          color: '#000',
          textDecoration: 'none',
          zIndex: 10000,
          borderTopLeftRadius: '12px',
          border: '1px solid #fff'
        }}
      >
        🕹️ Vibe Jam 2025
      </a>
    </div>
  );
}

export default App;