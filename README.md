# 🕵️‍♂️ Project: Operation "Whiskers & Waypoints"

Welcome, Agent. Your mission, should you choose to accept it, is to develop a piece of "Double-Agent" software. 

On the surface, it should appear to be a delightful, innocent utility for the public. Underneath, it must function as a sophisticated tracking beacon. We are testing your ability to handle real-time data, tricky mobile background execution, and the creative flair required to hide a spy tool in plain sight.

---

## 📜 The Brief

Build a **Mobile Application** that masquerades as a harmless utility (e.g., "Cat Spotter," "Weather Widget," or "Tip Calculator"). 

While the user is distracted by the frontend "utility," the app must silently relay their coordinates to our Command Center (the Backend) and store them in a persistent database.

### 🎯 Key Requirements

#### 1. The "Cover" (Frontend - React Native)
* **The Facade:** A functional UI that justifies the app's existence. If it's a "Cat Spotter," it should actually show cats (hint: use [TheCatAPI](https://thecatapi.com/)).
* **The Tracker:** The app must capture the user’s GPS location accurately.
* **The Stealth:** Tracking must continue even if the app is **minimized or the screen is locked** (Background Processes, with their known limitations).
* **The Comms:** Send location updates ($lat$, $long$) to the backend in real-time while the app is active.

#### 2. The "Command Center" (Backend - NestJS or Django)
* **The Receiver:** A socket gateway or API endpoint to ingest incoming coordinate data.
* **The Archive:** Store the "Last Known Location" for a user (identified by wathever you see fit) in a **PostgreSQL** database.
* **The Intelligence:** A simple dashboard (basic HTML, JSON endpoint or OpenAPI spec) that displays the current location and movement history of your "tracked agents."
* **Auth (Optional):** You may implement a full login flow or keep it simple with a basic email-entry session.

#### 3. Product Mindset
* We haven't provided a Figma file. You are the Lead Designer. 
* How does the "Spy" mode activate? Is it automatic? Is there a "Secret" gesture? How do you make the fake part of the app feel authentic?


## 🛠 Tech Stack
* **Frontend:** React Native (Expo or CLI).
* **Backend:** NestJS **OR** Django.
* **Database:** PostgreSQL.

## 🤖 AI Guidelines
We live in the future, and we expect you to use the tools available. **The use of AI (ChatGPT, Claude, Cursor, etc.) is highly encouraged.** However, we want to see your "prompt engineering" and how you direct the machine.

* If you use AI, you **must** include a file named `PROMPTS.md` in your submission.
* Inside, list the primary prompts you used (e.g., architecture planning, debugging background tasks, or bootstrapping the UI).

## 🚀 Submission Instructions
1.  **Fork** this repository.
2.  Build your solution in either the root or a folder named `candidate-solution`.
3.  Include a `DEVELOPMENT.md` explaining:
    * How to run your setup (Docker-compose is a massive plus!).
    * The "Secret" to activating the tracking (if applicable).
    * Any trade-offs or technical shortcuts you took.
4.  Include your `PROMPTS.md` file.
5.  Submit your work via a **Pull Request** to the `main` branch of this repo.

**Good luck, Agent. We'll be watching.**

---

## Implementation in this fork

See **[PROJECT.md](./PROJECT.md)** for architecture, ports, Docker, and how to run the admin static server on a separate Node port after `npm run build`.