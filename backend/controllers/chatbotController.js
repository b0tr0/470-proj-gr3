exports.handleChatMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const lower = message.toLowerCase();

    let reply = "I'm your TrafficAlert AI assistant. Ask me about real-time alerts or road conditions!";

    if (lower.includes('accident') || lower.includes('traffic')) {
      reply = "Check out the Feed tab for active crowd-sourced alerts near your location.";
    } else if (lower.includes('verify') || lower.includes('authority')) {
      reply = "Authority members review and verify incident accuracy inside the Authority Dashboard.";
    } else if (lower.includes('friend')) {
      reply = "Add friends under the Network tab to view their active commuting status.";
    }

    res.json({ reply });
  } catch (err) {
    res.status(500).json({ message: 'Chatbot service error', error: err.message });
  }
};