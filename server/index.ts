import express, { Request, Response } from 'express';
import cors from 'cors';
import { generateThreatOptions, analyzeThreats } from './services';

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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
