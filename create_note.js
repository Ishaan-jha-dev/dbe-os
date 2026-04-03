fetch("http://127.0.0.1:3000/api/notes", {
  method: "POST",
  headers: {"Content-Type": "application/json"},
  body: JSON.stringify({
    title: "How DBE OS Platform Works",
    subject: "general",
    author: "Admin",
    content: `## Welcome to DBE OS!

The DBE OS is a gamified learning platform.

### Core Features
- **Farm System**: You can grow virtual trees by studying! Focus sessions water your plots.
- **Tomatoes**: The main currency. Earn tomatoes by completing tasks, quizzes, and focus sessions.
- **Notes Library**: Read and annotate notes. Notes support beautiful markdown rendering!

> Get started by clicking 'Start Growing' and complete a Pomodoro session to water your crops!`
  })
}).then(res => res.json()).then(console.log).catch(console.error);
