# NBA AI ASSiTANT/AI AGENT
This project is a chatbox interface/assitant where it analyzes the performance of NBA players using PRA (Points, Rebounds, Assists) statistics using the NBA API made on Python, which was then implemented on
TypeScript, and HTML. This enabled another feature used which was CloudFlare Workers AI to generate summaries of these player performances using LLaMa 3. This is shown when you type the
name of a Player in the chatbox, which will result in a player summary of their recent games. Memory support via CloudFlare KV was also used to use the summarised repsones as storage
So every time you type the player's name, the response is saved.
## ACESSS THE WEBSITE HERE: 
https://nba-ai-agent.nba-stats-bot.workers.dev/


## Motivation
The reason behind this project was to:
- Build a full-stack AI application using Cloudflare Workers
- Explore NBA player performance analysis using real game data
- Learn how to integrate Workers AI (LLMs) into a real API
- Practice stateful memory using Cloudflare KV
- Serve a frontend directly from a Worker (no Pages required)
- Create a chat-style interface for intuitive user interaction
By combining live NBA stats with AI-generated analysis, the project turns raw numbers into clear, readable insights that are easy for anyone to understand.

## Features
- Analyze an NBA player’s recent game performances
- AI-generated summaries using Cloudflare Workers AI (LLaMA)
- Memory support via Cloudflare KV (cached player analyses)
- Chat-style web UI served directly from the Worker
- JSON API endpoint for programmatic access
- Single deployment (frontend + backend in one Worker)
- Publicly accessible from any device

## Example Outputs
- AI-written breakdowns of recent player performances
- Cached responses served instantly from memory
- Chat interface displaying:
- User input (player name)
- AI-generated analysis
- Source indicator (AI vs Memory)

<img width="526" height="391" alt="Screenshot 2026-01-05 120736" src="https://github.com/user-attachments/assets/80fe1963-c2d4-4989-8d04-76e11da23c6a" />
<img width="497" height="252" alt="Screenshot 2026-01-05 121233" src="https://github.com/user-attachments/assets/d23ab231-b6ad-4484-b87b-973f00efc5eb" />
<img width="417" height="224" alt="Screenshot 2026-01-05 120815" src="https://github.com/user-attachments/assets/1b1cb183-03b5-437e-a81e-516226399d2a" />
Notice how the first time you type the players name it is powered by the AI so it hasnt been stored into memory yet.
<img width="499" height="285" alt="Screenshot 2026-01-05 120836" src="https://github.com/user-attachments/assets/1db64b46-7401-41a6-9678-91165e610573" />
The second time when you type the sane player's name it will be from memory

## Libraries/Services used
- Cloudflare Workers – Serverless runtime
- Cloudflare Workers AI – LLM inference
- Cloudflare KV – Persistent memory/state
- TypeScript – Backend logic
- HTML / CSS / JavaScript – Frontend UI
- Python
- NBA API (via Python backend) – Player stats source

## Project Structure
```
CloudfFlareAssignmentNBA/
│
├── app.py                       
│
├── nba-ai-agent/
│   ├── src/
│   │   └── index.ts             
│   │
│   ├── public/
│   │   └── index.html          
│   │
│   ├── package.json             
│   ├── tsconfig.json            
│   ├── wrangler.toml            
│   ├── worker-configuration.d.ts
│   │
│   └── README.md
```
## System Architecture
1. User enters an NBA player name in the web UI
2. Cloudflare Worker receives the request
3. Worker checks KV memory for cached analysis
4. If not cached:
- Worker requests player stats from the Python API (app.py)
- Workers AI generates a natural-language analysis
- Result is stored in KV
5. Response is returned to the user

## API Endpoints
# Analyze Player (AI POWERED)
```
POST /ai/analyze_player
```
# Request body
```
{
  "name": "Ryan Rollins"
}
```
# Response
```
{
  "player": "Ryan Rollins",
  "analysis": "AI-generated performance summary...",
  "source": "ai | memory"
}
```
## Setup

1. **Clone the Repository**
```
https://github.com/dnzxvy/cf_ai_nba-ai-agent.git
cd CloudfFlareAssignmentNBA
```
2. **Install Python Dependencies/Packages**
```
pip install flask nba_api requests pandas
```
3. **Install Dependencies for nba-ai-agent/ folder**
```
cd nba-ai-agent
npm install
``` 









