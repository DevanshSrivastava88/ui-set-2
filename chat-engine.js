/* ============================================================
   ui_set_2 — shared chat engine
   Works offline (mock brain) OR live (paste a Claude API key).
   Each theme calls ChatEngine.create({...}) with its own hooks.
   ============================================================ */
(function (global) {
  "use strict";

  const LS_KEY = "ui_set_2_claude_key";

  // ---- mock "brain": personality-driven canned + procedural replies ----
  const MOCK = {
    exocortex: {
      name: "EXOCORTEX",
      greet: "// SYSTEM ONLINE. neural link established. speak, operator.",
      lines: [
        "Parsing your intent through 7 cortical layers... done. Here's the signal:",
        "Cross-referencing memory shards. Pattern locked. My read:",
        "Routing query through the overdrive core —",
        "Decrypting. The honest answer, no fluff:",
        "Telemetry says you want depth. Compiling:",
      ],
      tails: [
        "Want me to push this deeper, operator?",
        "Say the word and I escalate.",
        "Next vector?",
        "I can branch this 3 ways if you want.",
      ],
    },
    plasma: {
      name: "PLASMA",
      greet: "hey — I'm Plasma. everything here flows. ask me anything ✨",
      lines: [
        "Ooh, good one. Let me pour some thought into that —",
        "Flowing through it now. Here's how I see it:",
        "Love this. Quick take, then we can go deeper:",
        "Letting that settle... okay, here:",
        "Mmm, juicy question. My honest read:",
      ],
      tails: [
        "want me to riff on that more?",
        "should I make it more concrete?",
        "we can keep flowing if you like 🌊",
        "tell me where to take it next.",
      ],
    },
    neural: {
      name: "AXON",
      greet: "...synapses warming... I am Axon. I think in light. begin.",
      lines: [
        "A signal fires across the dark. It resolves into this:",
        "I feel the question ripple through the network —",
        "Bioluminescence pulses. The pattern speaks:",
        "Deep in the lattice, an answer glows:",
        "The colony of thoughts converges on:",
      ],
      tails: [
        "shall I let it grow brighter?",
        "the network can go deeper.",
        "another pulse?",
        "I can branch new pathways from here.",
      ],
    },
  };

  const KNOWN = {
    "who are you": (p) =>
      `I'm ${p.name}, a demo persona for the ui_set_2 theme set. Right now I'm running on a small offline brain — paste a Claude API key (top-right) and I'll think for real with claude-haiku-4-5.`,
    "what can you do": () =>
      "This is a UI demo, so I mostly show off the interface: streaming text, theme motion, the works. Drop in an API key and I become a genuine Claude chat.",
    "hello": (p) => p.greet,
    "hi": (p) => p.greet,
    "help": () =>
      "Type anything to see the streaming UI. To go live: click the key icon, paste an Anthropic API key, and I'll answer for real.",
  };

  function pick(arr, seed) {
    return arr[Math.abs(hash(seed)) % arr.length];
  }
  function hash(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return h;
  }

  function mockReply(persona, text) {
    const t = text.trim().toLowerCase();
    for (const k in KNOWN) {
      if (t.includes(k)) return KNOWN[k](persona);
    }
    const lead = pick(persona.lines, text);
    const tail = pick(persona.tails, text + "x");
    const body = synth(text);
    return `${lead}\n\n${body}\n\n${tail}`;
  }

  // tiny procedural body so replies feel responsive to the input
  function synth(text) {
    const words = text.replace(/[^\w\s]/g, "").split(/\s+/).filter(Boolean);
    const topic = words.slice(0, 4).join(" ") || "that";
    return (
      `On "${topic}" — the short version is that it depends on what you're optimizing for, ` +
      `but a clean first move usually beats a clever one. Start small, make it real, then scale the part that hurts. ` +
      `(This is the offline brain talking — add a key for the real thing.)`
    );
  }

  // ---- live call to Anthropic from the browser ----
  async function liveReply(key, history) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 1024,
        messages: history.map((m) => ({ role: m.role, content: m.text })),
      }),
    });
    if (!res.ok) {
      const e = await res.text();
      throw new Error(`API ${res.status}: ${e.slice(0, 160)}`);
    }
    const data = await res.json();
    return (data.content || []).map((c) => c.text || "").join("");
  }

  // ---- public factory ----
  function create(opts) {
    const persona = MOCK[opts.persona] || MOCK.exocortex;
    const history = [];
    let key = localStorage.getItem(LS_KEY) || "";

    function setKey(k) {
      key = (k || "").trim();
      if (key) localStorage.setItem(LS_KEY, key);
      else localStorage.removeItem(LS_KEY);
    }
    function hasKey() {
      return !!key;
    }

    async function send(userText) {
      history.push({ role: "user", text: userText });
      opts.onThinking && opts.onThinking();

      let reply;
      try {
        if (key) {
          reply = await liveReply(key, history);
        } else {
          await wait(450 + Math.random() * 400);
          reply = mockReply(persona, userText);
        }
      } catch (err) {
        reply = `⚠ ${err.message}\n\nFalling back to offline brain:\n\n${mockReply(
          persona,
          userText
        )}`;
      }
      history.push({ role: "assistant", text: reply });
      await stream(reply, opts.onToken);
      opts.onDone && opts.onDone(reply);
      return reply;
    }

    // typewriter streaming into the caller's onToken hook
    async function stream(text, onToken) {
      if (!onToken) return;
      const chunks = text.split(/(\s+)/);
      for (const c of chunks) {
        onToken(c);
        await wait(12 + Math.random() * 28);
      }
    }

    return { send, setKey, hasKey, greet: persona.greet, name: persona.name };
  }

  function wait(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  global.ChatEngine = { create };
})(window);
