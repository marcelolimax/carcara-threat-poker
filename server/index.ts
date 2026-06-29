import express, { Request, Response } from 'express';
import cors from 'cors';
import http from 'http';
import { generateThreatOptions, analyzeThreats, generateSecurityCards, generateRushQuestions } from './services';
import { attachRoomServer } from './rooms/roomServer';
import { V2AnalysisRequest } from './types';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.post('/api/generate-threat-options', async (req: Request, res: Response) => {
  const { userStory } = req.body;

  if (!userStory) {
    return res.status(400).json({ error: 'userStory is required' });
  }

  try {
    const options = await generateThreatOptions(userStory);
    res.json({ options });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while generating threat options' });
  }
});

app.post('/api/analyze-threats', async (req: Request, res: Response) => {
  const { userStory, allOptions, playerResponses } = req.body;

  if (!userStory || !allOptions || !playerResponses) {
    return res.status(400).json({ error: 'userStory, allOptions, and playerResponses are required' });
  }

  try {
    const analysis = await analyzeThreats(userStory, allOptions, playerResponses);
    res.json({ analyzedOptions: analysis });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while analyzing threats' });
  }
});

// v2 endpoint for generating Security Cards with ASP prioritization
app.post('/api/v2/generate-security-cards', async (req: Request, res: Response) => {
  const { userStories, contextoOpcional, votingData, includeVoting }: V2AnalysisRequest = req.body;

  if (!userStories || !Array.isArray(userStories) || userStories.length === 0) {
    return res.status(400).json({ error: 'userStories array is required and must not be empty' });
  }

  // Validate that at least one story is selected
  const selectedStories = userStories.filter(story => story.selected);
  if (selectedStories.length === 0) {
    return res.status(400).json({ error: 'At least one user story must be selected' });
  }

  // Validate voting data if voting is included
  if (includeVoting && (!votingData || votingData.length === 0)) {
    return res.status(400).json({ error: 'votingData is required when includeVoting is true' });
  }

  try {
    const cards = await generateSecurityCards(userStories, contextoOpcional, votingData);
    res.json({
      cards,
      aspRanking: cards, // Already sorted by ASP score in generateSecurityCards
      totalCards: cards.length,
      selectedStories: selectedStories.length,
      includedVoting: includeVoting,
      votingResponses: votingData?.length || 0
    });
  } catch (error) {
    console.error('Error generating security cards:', error);
    res.status(500).json({ error: 'An error occurred while generating security cards' });
  }
});

// Carcará Rush — gera um lote de perguntas do quiz STRIDE
app.post('/api/rush/questions', async (req: Request, res: Response) => {
  const { theme, count } = req.body || {};
  try {
    const questions = await generateRushQuestions(theme || '', count || 10);
    res.json({ questions });
  } catch (error) {
    console.error('Error generating rush questions:', error);
    res.status(500).json({ error: 'An error occurred while generating rush questions' });
  }
});

const server = http.createServer(app);

// Servidor WebSocket das salas multiplayer (em /api/ws)
attachRoomServer(server);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
