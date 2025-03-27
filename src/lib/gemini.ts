import { GoogleGenerativeAI } from '@google/generative-ai';
import { Chess } from 'chess.js';

const genAI = new GoogleGenerativeAI('');

export async function getAIMove(fen: string): Promise<string[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  
  // Create a temporary chess instance to get legal moves
  const tempGame = new Chess(fen);
  const legalMoves = tempGame.moves({ verbose: true });
  const legalMovesStr = legalMoves.map(m => m.san).join(', ');

  const prompt = `You are a chess engine. Given the following chess position in FEN notation: ${fen}

    Here are all legal moves in this position: ${legalMovesStr}

    Analyze the position and suggest the top 3 strongest moves from the legal moves list above.
    Return ONLY the moves separated by commas (e.g., 'e4, Nf6, O-O').
    The moves must be from the provided legal moves list.`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const moves = response.text().trim().split(',').map(move => move.trim());
  
  return moves;
}
