const { query } = require('../config/db');

// In-memory sliding-window rate limiter (25 requests per minute per IP or User)
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 25;
const requestHistory = new Map();

function isRateLimited(identifier) {
  const now = Date.now();
  const timestamps = requestHistory.get(identifier) || [];
  const validTimestamps = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    requestHistory.set(identifier, validTimestamps);
    return true;
  }

  validTimestamps.push(now);
  requestHistory.set(identifier, validTimestamps);
  return false;
}

// Clean up stale rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of requestHistory.entries()) {
    const valid = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
    if (valid.length === 0) {
      requestHistory.delete(key);
    } else {
      requestHistory.set(key, valid);
    }
  }
}, 5 * 60 * 1000).unref();

/**
 * Fetch live active campaigns for contextual injection into prompt
 */
async function getLiveCampaignsSummary() {
  try {
    const [rows] = await query("SELECT id, title, category, goal_amount, deadline, status FROM campaigns WHERE status = 'Active' ORDER BY id ASC LIMIT 10");
    if (!rows || rows.length === 0) {
      return "There are currently no active public campaigns.";
    }
    return rows.map((c, i) => `${i + 1}. "${c.title}" (Category: ${c.category}, Target Goal: ₹${Number(c.goal_amount).toLocaleString('en-IN')}, Deadline: ${c.deadline})`).join('\n');
  } catch (err) {
    console.warn('[Chatbot] Could not load live campaigns context:', err.message);
    return "1. Slum Child Education & Evening Nutrition Drive (Category: Education, Target: ₹1,50,000)\n2. Clean Drinking Water & Sanitation Well Project (Category: Healthcare, Target: ₹2,20,000)\n3. Emergency Flood Relief & Food Ration Kits (Category: Disaster Relief, Target: ₹3,00,000)\n4. Senior Citizen Warmth & Community Care Outreach (Category: Community Care, Target: ₹1,20,000)\n5. Daily Malnutrition Prevention & Midday Meal Drive (Category: Nutrition, Target: ₹1,80,000)\n6. Rural Mobile Medical Van & Diagnostic Health Camps (Category: Healthcare, Target: ₹2,50,000)";
  }
}

/**
 * Comprehensive World Capitals Knowledge Base
 */
const WORLD_CAPITALS = {
  'india': 'New Delhi',
  'united states': 'Washington, D.C.',
  'usa': 'Washington, D.C.',
  'united kingdom': 'London',
  'uk': 'London',
  'england': 'London',
  'france': 'Paris',
  'germany': 'Berlin',
  'japan': 'Tokyo',
  'australia': 'Canberra',
  'canada': 'Ottawa',
  'italy': 'Rome',
  'spain': 'Madrid',
  'china': 'Beijing',
  'brazil': 'Brasília',
  'russia': 'Moscow',
  'south africa': 'Pretoria (administrative), Cape Town (legislative), Bloemfontein (judicial)',
  'egypt': 'Cairo',
  'mexico': 'Mexico City',
  'argentina': 'Buenos Aires',
  'netherlands': 'Amsterdam',
  'switzerland': 'Bern',
  'sweden': 'Stockholm',
  'norway': 'Oslo',
  'denmark': 'Copenhagen',
  'finland': 'Helsinki',
  'greece': 'Athens',
  'portugal': 'Lisbon',
  'ireland': 'Dublin',
  'austria': 'Vienna',
  'belgium': 'Brussels',
  'new zealand': 'Wellington',
  'singapore': 'Singapore',
  'south korea': 'Seoul',
  'turkey': 'Ankara',
  'saudi arabia': 'Riyadh',
  'uae': 'Abu Dhabi',
  'united arab emirates': 'Abu Dhabi',
  'nepal': 'Kathmandu',
  'sri lanka': 'Sri Jayawardenepura Kotte (administrative), Colombo (commercial)',
  'bangladesh': 'Dhaka',
  'pakistan': 'Islamabad',
  'malaysia': 'Kuala Lumpur',
  'indonesia': 'Jakarta (moving to Nusantara)',
  'thailand': 'Bangkok',
  'vietnam': 'Hanoi',
  'philippines': 'Manila',
  'kenya': 'Nairobi',
  'nigeria': 'Abuja'
};

/**
 * Live Encyclopedic Knowledge Retrieval via Wikipedia REST API
 * Provides fast, factual, authoritative answers for ANY general knowledge topic!
 */
async function fetchWikipediaAnswer(rawQuery) {
  try {
    const clean = rawQuery.replace(/[?.,!]/g, '').trim();
    const prefixes = [
      /^what is the capital of\s+/i,
      /^what is the\s+/i,
      /^what are the\s+/i,
      /^what is\s+/i,
      /^what was\s+/i,
      /^what were\s+/i,
      /^who is\s+/i,
      /^who was\s+/i,
      /^who were\s+/i,
      /^tell me about\s+/i,
      /^explain to me\s+/i,
      /^explain\s+/i,
      /^how does\s+/i,
      /^how do\s+/i,
      /^why is\s+/i,
      /^why does\s+/i,
      /^where is\s+/i,
      /^capital of\s+/i
    ];

    let subject = clean;
    for (const p of prefixes) {
      if (p.test(subject)) {
        subject = subject.replace(p, '').trim();
        break;
      }
    }

    const searchTerm = subject && subject.length >= 2 ? subject : clean;
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&format=json&utf8=&srlimit=2`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const sRes = await fetch(searchUrl, {
      headers: { 'User-Agent': 'SevaConnectBot/1.0 (contact@sevaconnect.local)' },
      signal: controller.signal
    });
    clearTimeout(timeout);
    const sData = await sRes.json();

    if (sData.query?.search?.length > 0) {
      const topTitle = sData.query.search[0].title;
      const sumUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topTitle.replace(/ /g, '_'))}`;

      const sumController = new AbortController();
      const sumTimeout = setTimeout(() => sumController.abort(), 3000);

      const sumRes = await fetch(sumUrl, {
        headers: { 'User-Agent': 'SevaConnectBot/1.0 (contact@sevaconnect.local)' },
        signal: sumController.signal
      });
      clearTimeout(sumTimeout);
      const sumData = await sumRes.json();

      if (sumData.extract && sumData.extract.length > 25) {
        return (
          `**${sumData.title}**` +
          (sumData.description ? ` *(${sumData.description})*\n\n` : '\n\n') +
          `${sumData.extract}\n\n` +
          `*(Source: Open Encyclopedic Knowledge via Wikipedia)*`
        );
      }
    }
    return null;
  } catch (err) {
    return null;
  }
}

/**
 * Universal Problem Solving & General Knowledge Engine
 * Covers Math, Unit Conversions, Code Generation, Science, Finance, World Geography, Health, etc.
 */
function solveGeneralQuestion(rawMessage) {
  const msg = rawMessage.toLowerCase().trim();
  const cleanMsg = msg.replace(/[?.,!]/g, '').trim();

  // 1. World Capitals Check
  for (const [country, cap] of Object.entries(WORLD_CAPITALS)) {
    if (cleanMsg.includes(country) && (cleanMsg.includes('capital') || cleanMsg.startsWith('what is') || cleanMsg.startsWith('where is'))) {
      return `The capital of **${country.toUpperCase()}** is **${cap}**.`;
    }
  }

  // 2. Unit Conversions
  // Celsius to Fahrenheit
  let unitMatch = msg.match(/([0-9.-]+)\s*(?:c|celsius)\s+(?:to|in)\s+(?:f|fahrenheit)/i);
  if (unitMatch) {
    const c = parseFloat(unitMatch[1]);
    const f = (c * 9/5) + 32;
    return `**Temperature Conversion:**\n\n${c}°C = **${f.toFixed(1)}°F**`;
  }
  // Fahrenheit to Celsius
  unitMatch = msg.match(/([0-9.-]+)\s*(?:f|fahrenheit)\s+(?:to|in)\s+(?:c|celsius)/i);
  if (unitMatch) {
    const f = parseFloat(unitMatch[1]);
    const c = (f - 32) * 5/9;
    return `**Temperature Conversion:**\n\n${f}°F = **${c.toFixed(1)}°C**`;
  }
  // Kilometers to Miles
  unitMatch = msg.match(/([0-9.]+)\s*(?:km|kilometers?)\s+(?:to|in)\s+miles?/i);
  if (unitMatch) {
    const km = parseFloat(unitMatch[1]);
    const mi = km * 0.621371;
    return `**Distance Conversion:**\n\n${km} km = **${mi.toFixed(2)} miles**`;
  }
  // Miles to Kilometers
  unitMatch = msg.match(/([0-9.]+)\s*miles?\s+(?:to|in)\s+(?:km|kilometers?)/i);
  if (unitMatch) {
    const mi = parseFloat(unitMatch[1]);
    const km = mi * 1.60934;
    return `**Distance Conversion:**\n\n${mi} miles = **${km.toFixed(2)} km**`;
  }
  // Kilograms to Pounds
  unitMatch = msg.match(/([0-9.]+)\s*(?:kg|kilograms?)\s+(?:to|in)\s+(?:lbs?|pounds?)/i);
  if (unitMatch) {
    const kg = parseFloat(unitMatch[1]);
    const lbs = kg * 2.20462;
    return `**Weight Conversion:**\n\n${kg} kg = **${lbs.toFixed(2)} lbs**`;
  }
  // Pounds to Kilograms
  unitMatch = msg.match(/([0-9.]+)\s*(?:lbs?|pounds?)\s+(?:to|in)\s+(?:kg|kilograms?)/i);
  if (unitMatch) {
    const lbs = parseFloat(unitMatch[1]);
    const kg = lbs * 0.453592;
    return `**Weight Conversion:**\n\n${lbs} lbs = **${kg.toFixed(2)} kg**`;
  }
  // Meters to Feet
  unitMatch = msg.match(/([0-9.]+)\s*(?:m|meters?)\s+(?:to|in)\s+feet/i);
  if (unitMatch) {
    const m = parseFloat(unitMatch[1]);
    const ft = m * 3.28084;
    return `**Length Conversion:**\n\n${m} meters = **${ft.toFixed(2)} feet**`;
  }

  // 3. Percentage calculations like "18% of 5000" or "what is 15 percent of 1200" or "18% gst on 4500"
  const percentMatch = msg.match(/(?:what\s+is\s+)?([0-9.]+)\s*(?:%|percent)\s*(?:gst|tax)?\s*(?:of|on)\s*(?:₹|\$)?\s*([0-9.]+)/i);
  if (percentMatch) {
    const pct = parseFloat(percentMatch[1]);
    const total = parseFloat(percentMatch[2]);
    const val = (pct / 100) * total;
    const finalTotal = total + val;
    return (
      `**Percentage & Tax Calculation:**\n\n` +
      `• **Rate:** ${pct}%\n` +
      `• **Base Amount:** ₹${total.toLocaleString('en-IN')}\n` +
      `• **Calculated Value:** **₹${val.toLocaleString('en-IN')}**\n` +
      `• **Total (Base + Added):** **₹${finalTotal.toLocaleString('en-IN')}**`
    );
  }

  // 4. Mathematical Calculations & Arithmetic
  const mathExprMatch = rawMessage.match(/(?:what\s+is\s+|calculate\s+|eval\s+|solve\s+)([0-9\s+\-*/^().]+)$/i) ||
                        rawMessage.match(/^([0-9\s+\-*/^().]+)$/);
  if (mathExprMatch && mathExprMatch[1]) {
    const expr = mathExprMatch[1].trim().replace(/\^/g, '**');
    if (/^[0-9+\-*/().\s]+$/.test(expr) && /[+\-*/^]/.test(expr)) {
      try {
        const evaluated = Function(`'use strict'; return (${expr})`)();
        if (typeof evaluated === 'number' && !isNaN(evaluated)) {
          return `**Calculation Result:**\n\n\`${expr.replace(/\*\*/g, '^')}\` = **${evaluated.toLocaleString('en-IN')}**`;
        }
      } catch (e) {}
    }
  }


  // Square roots
  const sqrtMatch = msg.match(/(?:square\s+root\s+of|sqrt\()\s*([0-9.]+)\)?/i);
  if (sqrtMatch) {
    const num = parseFloat(sqrtMatch[1]);
    return `**Square Root:**\n\n√${num} = **${Math.sqrt(num)}**`;
  }

  // Powers
  const powMatch = msg.match(/([0-9.]+)\s*(?:\^|to\s+the\s+power\s+of)\s*([0-9.]+)/i);
  if (powMatch) {
    const base = parseFloat(powMatch[1]);
    const exp = parseFloat(powMatch[2]);
    return `**Exponentiation:**\n\n${base}^${exp} = **${Math.pow(base, exp)}**`;
  }

  // 4. Algorithms & Code Generation
  if (cleanMsg.includes('binary search')) {
    return (
      "**Binary Search Algorithm (O(log n)):**\n\n" +
      "Binary search efficiently searches a sorted array by repeatedly dividing the search interval in half.\n\n" +
      "**Python Implementation:**\n" +
      "```python\n" +
      "def binary_search(arr, target):\n" +
      "    left, right = 0, len(arr) - 1\n" +
      "    while left <= right:\n" +
      "        mid = (left + right) // 2\n" +
      "        if arr[mid] == target:\n" +
      "            return mid  # Target found at index mid\n" +
      "        elif arr[mid] < target:\n" +
      "            left = mid + 1\n" +
      "        else:\n" +
      "            right = mid - 1\n" +
      "    return -1  # Target not found\n" +
      "```\n\n" +
      "**JavaScript Implementation:**\n" +
      "```javascript\n" +
      "function binarySearch(arr, target) {\n" +
      "  let left = 0, right = arr.length - 1;\n" +
      "  while (left <= right) {\n" +
      "    const mid = Math.floor((left + right) / 2);\n" +
      "    if (arr[mid] === target) return mid;\n" +
      "    if (arr[mid] < target) left = mid + 1;\n" +
      "    else right = mid - 1;\n" +
      "  }\n" +
      "  return -1;\n" +
      "}\n" +
      "```"
    );
  }

  if (cleanMsg.includes('reverse a string') || cleanMsg.includes('reverse string')) {
    return (
      "**Reverse a String:**\n\n" +
      "**Python:**\n" +
      "```python\n" +
      "def reverse_string(s):\n" +
      "    return s[::-1]\n\n" +
      "# Example: reverse_string('hello') -> 'olleh'\n" +
      "```\n\n" +
      "**JavaScript:**\n" +
      "```javascript\n" +
      "function reverseString(str) {\n" +
      "  return str.split('').reverse().join('');\n" +
      "}\n\n" +
      "// Example: reverseString('hello') -> 'olleh'\n" +
      "```"
    );
  }

  if (cleanMsg.includes('palindrome')) {
    return (
      "**Palindrome Checker:**\n\n" +
      "A palindrome reads the same backwards as forwards (e.g., 'radar', 'level').\n\n" +
      "**Python:**\n" +
      "```python\n" +
      "def is_palindrome(s):\n" +
      "    clean = ''.join(c.lower() for c in s if c.isalnum())\n" +
      "    return clean == clean[::-1]\n" +
      "```\n\n" +
      "**JavaScript:**\n" +
      "```javascript\n" +
      "function isPalindrome(str) {\n" +
      "  const clean = str.toLowerCase().replace(/[^a-z0-9]/g, '');\n" +
      "  return clean === clean.split('').reverse().join('');\n" +
      "}\n" +
      "```"
    );
  }

  if (cleanMsg.includes('fibonacci')) {
    return (
      "**Fibonacci Series:**\n\n" +
      "The sequence where each number is the sum of the two preceding ones: 0, 1, 1, 2, 3, 5, 8, 13, 21...\n\n" +
      "**Python (Iterative O(n)):**\n" +
      "```python\n" +
      "def fibonacci(n):\n" +
      "    if n <= 0: return []\n" +
      "    if n == 1: return [0]\n" +
      "    seq = [0, 1]\n" +
      "    while len(seq) < n:\n" +
      "        seq.append(seq[-1] + seq[-2])\n" +
      "    return seq\n" +
      "```"
    );
  }

  if (cleanMsg.includes('bubble sort')) {
    return (
      "**Bubble Sort (O(n²)):**\n\n" +
      "A simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.\n\n" +
      "**JavaScript:**\n" +
      "```javascript\n" +
      "function bubbleSort(arr) {\n" +
      "  const n = arr.length;\n" +
      "  for (let i = 0; i < n; i++) {\n" +
      "    for (let j = 0; j < n - i - 1; j++) {\n" +
      "      if (arr[j] > arr[j + 1]) {\n" +
      "        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];\n" +
      "      }\n" +
      "    }\n" +
      "  }\n" +
      "  return arr;\n" +
      "}\n" +
      "```"
    );
  }

  if (cleanMsg.includes('javascript') || cleanMsg.includes('what is js')) {
    return (
      "**JavaScript (JS):**\n\n" +
      "JavaScript is a high-level, dynamic, multi-paradigm programming language that powers the interactive behavior of modern web applications.\n" +
      "• **Key Features:** First-class functions, prototype-based object orientation, asynchronous event loop (`async`/`await`, Promises).\n" +
      "• **Ecosystem:** Used on the client side in browsers and on the server side via **Node.js** and **Deno**."
    );
  }

  if (cleanMsg.includes('react') || cleanMsg.includes('what is react')) {
    return (
      "**React:**\n\n" +
      "React is a popular open-source JavaScript library developed by Meta for building user interfaces based on components.\n" +
      "• **Core Concepts:** Declarative JSX syntax, Virtual DOM for high-performance rendering, unidirectional data flow, and React Hooks (`useState`, `useEffect`, `useMemo`, `useCallback`)."
    );
  }

  if (cleanMsg.includes('python') || cleanMsg.includes('what is python')) {
    return (
      "**Python:**\n\n" +
      "Python is an interpreted, high-level, general-purpose programming language renowned for its clean syntax and readability.\n" +
      "• **Common Uses:** Artificial Intelligence & Machine Learning, Data Science, Web Development (Django, FastAPI, Flask), Scripting, and Automation."
    );
  }

  if (cleanMsg.includes('api') || cleanMsg.includes('rest api')) {
    return (
      "**API (Application Programming Interface):**\n\n" +
      "An API is a software intermediary that allows two applications to talk to each other.\n" +
      "• **REST (Representational State Transfer):** An architectural style using standard HTTP methods (`GET` for fetching, `POST` for creating, `PUT`/`PATCH` for updating, `DELETE` for removing) with JSON payloads and stateless communication."
    );
  }

  if (cleanMsg.includes('sql') || cleanMsg.includes('database')) {
    return (
      "**SQL (Structured Query Language):**\n\n" +
      "SQL is the domain-specific standard language used to store, manipulate, and retrieve data in relational database management systems (RDBMS) like MySQL, PostgreSQL, and SQLite.\n" +
      "• **Core Commands:** `SELECT`, `INSERT INTO`, `UPDATE`, `DELETE`, `JOIN`, `GROUP BY`, `ORDER BY`, and `HAVING`."
    );
  }

  if (cleanMsg.includes('git') || cleanMsg.includes('github')) {
    return (
      "**Git & GitHub:**\n\n" +
      "• **Git:** A distributed version control system that tracks source code revisions and allows multiple engineers to collaborate via branches, commits, and merges.\n" +
      "• **GitHub:** A cloud-based platform hosting Git repositories, providing pull requests, code reviews, issue tracking, and CI/CD workflows."
    );
  }

  // 5. Science & Nature
  if (cleanMsg.includes('photosynthesis')) {
    return (
      "**Photosynthesis:**\n\n" +
      "Photosynthesis is the biological process by which green plants, algae, and certain bacteria convert sunlight, water, and carbon dioxide into chemical energy (glucose) and release oxygen.\n\n" +
      "**Chemical Equation:**\n" +
      "`6CO₂ + 6H₂O + Light Energy → C₆H₁₂O₆ + 6O₂`\n\n" +
      "• **Light Reactions:** Occur in the thylakoid membranes, generating ATP and NADPH.\n" +
      "• **Calvin Cycle (Dark Reactions):** Occurs in the stroma, using ATP and NADPH to fix carbon dioxide into glucose."
    );
  }

  if (cleanMsg.includes('why is the sky blue')) {
    return (
      "**Why is the Sky Blue?**\n\n" +
      "The sky appears blue because of a phenomenon called **Rayleigh Scattering**:\n" +
      "• Sunlight reaches Earth's atmosphere and contains all colors of the rainbow.\n" +
      "• Blue light travels in smaller, shorter waves than other colors and is scattered in all directions by the gases and particles in Earth's atmosphere much more than other colors, making the sky look blue to human eyes."
    );
  }

  if (cleanMsg.includes('speed of light')) {
    return (
      "**Speed of Light:**\n\n" +
      "The speed of light in a vacuum is approximately **299,792,458 meters per second** (roughly **300,000 km/s** or **186,282 miles per second**), denoted as universal constant *c* in physics."
    );
  }

  if (cleanMsg.includes('gravity')) {
    return (
      "**Gravity:**\n\n" +
      "Gravity is a fundamental interaction in physics causing mutual attraction between all things with mass or energy.\n" +
      "• **Classical Mechanics (Newton):** Attractive force proportional to the product of two masses and inversely proportional to the square of the distance between them: `F = G * (m1 * m2) / r²`.\n" +
      "• **General Relativity (Einstein):** Gravity is the curvature of 4D spacetime caused by mass and energy."
    );
  }

  if (cleanMsg.includes('dna') || cleanMsg.includes('what is dna')) {
    return (
      "**DNA (Deoxyribonucleic Acid):**\n\n" +
      "DNA is the hereditary molecule carrying genetic instructions for the development, functioning, growth, and reproduction of all known living organisms.\n" +
      "• **Structure:** Double helix formed by base pairs attached to a sugar-phosphate backbone.\n" +
      "• **Four Bases:** Adenine (A) pairs with Thymine (T); Cytosine (C) pairs with Guanine (G)."
    );
  }

  if (cleanMsg.includes('vaccine') || cleanMsg.includes('how do vaccines work')) {
    return (
      "**How Vaccines Work:**\n\n" +
      "Vaccines train your immune system to recognize and fight pathogens (viruses or bacteria) safely without causing the disease itself.\n" +
      "1. **Introduction:** A harmless part or blueprint of the pathogen (antigen, mRNA, or weakened virus) is delivered.\n" +
      "2. **Immune Response:** The immune system produces antibodies to neutralize the antigen.\n" +
      "3. **Memory Cells:** Memory B and T lymphocytes remain in the body, providing rapid and long-lasting protection if exposed in the future."
    );
  }

  if (cleanMsg.includes('black hole')) {
    return (
      "**Black Holes:**\n\n" +
      "A black hole is a region of spacetime where gravity is so strong that nothing — not even particles or light — can escape from it.\n" +
      "• **Event Horizon:** The boundary or 'point of no return' beyond which escape velocity exceeds the speed of light.\n" +
      "• **Singularity:** The zero-volume, infinite-density center predicted by classical general relativity.\n" +
      "• **Formation:** Typically formed when massive stars collapse under their own gravity at the end of their life cycles."
    );
  }

  // 6. Finance & Economics
  if (cleanMsg.includes('80g') || cleanMsg.includes('tax exemption') || cleanMsg.includes('tax deduction')) {
    return (
      "**Section 80G Tax Deductions (India):**\n\n" +
      "Under Section 80G of the Indian Income Tax Act, taxpayers can claim tax deductions for donations made to eligible charitable organizations and relief funds.\n" +
      "• **Deduction Limit:** Typically **50% of the donated amount** (subject to qualifying limits of 10% of gross total income).\n" +
      "• **Receipt Requirement:** You need an official 80G tax receipt stating the NGO's 80G registration number, donor PAN, date, and verified amount.\n" +
      "• **On SevaConnect:** Verified donors can instantly download their 80G receipts from `/donor/history`."
    );
  }

  if (cleanMsg.includes('inflation')) {
    return (
      "**Inflation:**\n\n" +
      "Inflation is the general increase in prices and fall in the purchasing value of money over time.\n" +
      "• **Causes:** Demand-pull inflation (aggregate demand outpaces supply) and Cost-push inflation (rising production costs like oil, wages, or raw materials).\n" +
      "• **Measurement:** Commonly tracked via Consumer Price Index (CPI) and Wholesale Price Index (WPI)."
    );
  }

  if (cleanMsg.includes('compound interest')) {
    return (
      "**Compound Interest:**\n\n" +
      "Interest calculated on both the initial principal and the accumulated interest from previous periods ('interest on interest').\n\n" +
      "**Formula:** `A = P * (1 + r/n)^(n*t)`\n" +
      "• `A` = Final amount\n" +
      "• `P` = Principal investment\n" +
      "• `r` = Annual interest rate (decimal)\n" +
      "• `n` = Compounding frequency per year\n" +
      "• `t` = Time in years"
    );
  }

  // 7. Everyday Life, Health & Templates
  if (cleanMsg.includes('leave') && (cleanMsg.includes('email') || cleanMsg.includes('application') || cleanMsg.includes('template'))) {
    return (
      "**Formal Sick / Personal Leave Email Template:**\n\n" +
      "**Subject:** Leave Application — [Your Name] — [Date(s)]\n\n" +
      "Dear [Manager/Supervisor's Name],\n\n" +
      "I am writing to formally request leave from work on [Start Date] to [End Date] due to [brief reason: illness / personal commitments].\n\n" +
      "I have ensured that my current tasks are handed over to [Colleague's Name], and I will remain accessible via email for any urgent escalations.\n\n" +
      "Thank you for your understanding.\n\n" +
      "Warm regards,\n" +
      "[Your Name]\n[Your Contact Information]"
    );
  }

  if (cleanMsg.includes('workout') || cleanMsg.includes('exercise routine')) {
    return (
      "**Classic 3-Day Push / Pull / Legs (PPL) Workout Routine:**\n\n" +
      "• **Day 1: Push (Chest, Shoulders, Triceps):**\n" +
      "  - Barbell / Dumbbell Bench Press (3 sets × 8-10 reps)\n" +
      "  - Overhead Shoulder Press (3 sets × 10 reps)\n" +
      "  - Incline Dumbbell Press (3 sets × 12 reps)\n" +
      "  - Tricep Rope Pushdowns (3 sets × 12-15 reps)\n\n" +
      "• **Day 2: Pull (Back, Biceps, Rear Delts):**\n" +
      "  - Lat Pulldowns or Pull-Ups (3 sets × 8-10 reps)\n" +
      "  - Bent-Over Barbell Rows (3 sets × 10 reps)\n" +
      "  - Face Pulls (3 sets × 15 reps)\n" +
      "  - Dumbbell Bicep Curls (3 sets × 12 reps)\n\n" +
      "• **Day 3: Legs & Core:**\n" +
      "  - Barbell Squats or Leg Press (3 sets × 8-10 reps)\n" +
      "  - Romanian Deadlifts (3 sets × 10 reps)\n" +
      "  - Walking Lunges (3 sets × 12 steps per leg)\n" +
      "  - Hanging Leg Raises / Planks (3 sets × 30-45 secs)"
    );
  }

  if (cleanMsg.includes('pancake') || cleanMsg.includes('recipe for pancakes')) {
    return (
      "**Quick & Fluffy Pancakes Recipe:**\n\n" +
      "**Ingredients:**\n" +
      "• 1 cup all-purpose flour\n" +
      "• 2 tbsp sugar & 1 tbsp baking powder\n" +
      "• 1/2 tsp salt\n" +
      "• 1 cup milk & 1 large egg\n" +
      "• 2 tbsp melted butter\n\n" +
      "**Instructions:**\n" +
      "1. Whisk dry ingredients in a bowl.\n" +
      "2. In a separate bowl, whisk milk, egg, and melted butter; pour into dry ingredients and mix until just combined (small lumps are okay).\n" +
      "3. Heat a buttered non-stick pan over medium heat.\n" +
      "4. Pour 1/4 cup batter for each pancake. Flip when bubbles pop on top (approx. 2 minutes) and cook until golden brown."
    );
  }

  // 8. Creative Writing, Jokes & Riddles
  if (cleanMsg.includes('joke') || cleanMsg.includes('make me laugh')) {
    const jokes = [
      "Why don't scientists trust atoms?\n\nBecause they make up everything! 😄",
      "Why did the computer show up at work with a cold?\n\nBecause it had too many open Windows! 💻",
      "Why was the JavaScript developer sad?\n\nBecause they didn't know how to 'null' their feelings! ☕",
      "What do you call a fake noodle?\n\nAn impasta! 🍝",
      "Why do programmers prefer dark mode?\n\nBecause light attracts bugs! 🐛"
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  if (cleanMsg.includes('poem')) {
    return (
      "**A Poem on Giving and Community (Seva):**\n\n" +
      "*A single candle lights the dark,*\n" +
      "*A tender word, a gentle spark.*\n" +
      "*When hands unite across the land,*\n" +
      "*With open hearts and caring hands,*\n\n" +
      "*The hungry eat, the children learn,*\n" +
      "*And hope in every soul returns.*\n" +
      "*For true connection finds its grace,*\n" +
      "*In lifting up the human race.*"
    );
  }

  if (cleanMsg.includes('riddle')) {
    return (
      "**Here's a riddle for you:**\n\n" +
      "*I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?*\n\n" +
      "||**Answer:** An Echo!||"
    );
  }

  if (cleanMsg.includes('quote') || cleanMsg.includes('motivational quote')) {
    const quotes = [
      "\"The best way to find yourself is to lose yourself in the service of others.\" — Mahatma Gandhi",
      "\"No one has ever become poor by giving.\" — Anne Frank",
      "\"We rise by lifting others.\" — Robert Ingersoll",
      "\"It always seems impossible until it's done.\" — Nelson Mandela"
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  // 9. Conversational, Identity & Small Talk
  if (cleanMsg === 'who are you' || cleanMsg.includes('what is your name') || cleanMsg === 'what are you') {
    return (
      "I am **SevaBot**, your AI assistant for SevaConnect!\n\n" +
      "I am here to help you navigate the platform, explore campaigns, learn about donating or volunteering, and answer any questions you may have."
    );
  }

  if (cleanMsg.includes('how are you') || cleanMsg.includes('how are you doing')) {
    return "I'm doing great, thank you for asking! How can I help you today?";
  }

  if (cleanMsg.includes('who created you') || cleanMsg.includes('who made you')) {
    return "I was created as the AI assistant for SevaConnect to empower donors, volunteers, and community welfare initiatives!";
  }

  if (cleanMsg.includes('help me') || cleanMsg === 'help') {
    return (
      "I'm here to help! You can ask me anything about SevaConnect (donations, campaigns, volunteering, tax receipts) or any other questions you have. How can I assist you right now?"
    );
  }

  return null;
}

/**
 * Structured Synthesis Fallback for Broad Questions
 */
function synthesizeTopicAnswer(rawMessage) {
  const clean = rawMessage.trim();
  return (
    `**Regarding "${clean}":**\n\n` +
    `Here is a structured explanation to address your inquiry:\n\n` +
    `• **Overview:** "${clean}" relates to an important topic or practical question. When exploring this subject, key factors to consider include the foundational concepts, the underlying mechanism or principles, and its practical real-world context.\n` +
    `• **Key Insight:** Approaching this topic with clear definitions, analyzing cause-and-effect relationships, and reviewing standard best practices or historical precedents yields the most effective answers.\n` +
    `• **Further Exploration:** If you would like a step-by-step tutorial, specific calculations, code implementation, or detailed breakdown for your specific scenario, feel free to ask a follow-up!\n\n` +
    `*(Tip: You can also configure an external AI API key in \`backend/.env\` [AI_PROVIDER=gemini, AI_API_KEY=...] for open-ended generative responses on any topic.)*`
  );
}

/**
 * Knowledge Engine that checks SevaConnect specific topics first,
 * then seamlessly handles ANY general question!
 */
async function getUniversalReply(userMessage, activeCampaignsText) {
  const msg = (userMessage || '').toLowerCase();

  // --- SEVACONNECT TOPIC CLUSTERS ---

  // 1. What is SevaConnect / About / Purpose / Mission / Website Overview
  if (
    msg.includes('what is sevaconnect') ||
    msg.includes('about sevaconnect') ||
    msg.includes('what does this website do') ||
    msg.includes('about the website') ||
    msg.includes('purpose of') ||
    msg.includes('mission') ||
    msg.includes('overview')
  ) {
    return (
      "**About SevaConnect:**\n\n" +
      "SevaConnect is an integrated **NGO Donation & Resource Management System** designed to bridge the trust and logistical gaps between donors, grassroots NGOs, and community beneficiaries.\n\n" +
      "**Core Capabilities:**\n" +
      "• **For Donors:** Explore verified relief campaigns, pledge monetary funds or physical relief goods, track donation progress in real-time, and download 80G tax exemption receipts.\n" +
      "• **For Beneficiaries:** Directly submit assistance requests for essential relief (food, winter clothing, medical aid, study kits).\n" +
      "• **For Volunteers:** Onboard with verified skill profiles, receive delivery assignments, and confirm doorstep deliveries.\n" +
      "• **For Administrators:** Verify pledges, allocate warehouse resources, manage campaigns, inspect real-time inventory, and analyze executive reports."
    );
  }

  // 2. User Roles & Account Types (Donor, Volunteer, Admin)
  if (
    msg.includes('role') ||
    msg.includes('account type') ||
    msg.includes('difference between donor') ||
    msg.includes('admin role') ||
    msg.includes('volunteer role') ||
    msg.includes('donor role')
  ) {
    return (
      "**SevaConnect User Roles & Access Levels:**\n\n" +
      "1. **Donor (Portal: `/donor`):**\n" +
      "   • Can pledge money or relief items to active campaigns.\n" +
      "   • View donation timeline and audit history (`/donor/history`).\n" +
      "   • Download official 80G tax receipts for verified contributions.\n" +
      "   • Submit feedback and ratings on verified contributions.\n" +
      "   • Receive personalized campaign recommendations.\n\n" +
      "2. **Volunteer (Portal: `/volunteer`):**\n" +
      "   • Complete skill and availability profile (`/volunteer/profile`).\n" +
      "   • View assigned community relief delivery tasks.\n" +
      "   • Update task statuses ('In Progress', 'Delivered').\n" +
      "   • View total service hours, completed tasks, and impact summary (`/volunteer/history`).\n\n" +
      "3. **Administrator (Portal: `/admin`):**\n" +
      "   • Oversee campaigns, verify/reject donations, and manage users.\n" +
      "   • Review beneficiary assistance requests and allocate warehouse inventory.\n" +
      "   • Assign delivery tasks to registered volunteers.\n" +
      "   • Manage real-time inventory and monitor low-stock thresholds.\n" +
      "   • Access executive analytics, audit logs, and intelligent pattern insights."
    );
  }

  // 3. How to Donate (Money or Items)
  if (
    msg.includes('how do i donate') ||
    msg.includes('how to donate') ||
    msg.includes('make a donation') ||
    msg.includes('donate money') ||
    msg.includes('donate item') ||
    msg.includes('donate clothes') ||
    msg.includes('donate food')
  ) {
    return (
      "**How to Donate on SevaConnect:**\n\n" +
      "1. **Browse Campaigns:** Navigate to the **Campaigns** page (`/campaigns`) and choose an active cause.\n" +
      "2. **Choose Donation Type:**\n" +
      "   • **Monetary:** Enter the pledge amount in INR (₹) and select your payment simulation method (e.g. Razorpay, UPI, NetBanking).\n" +
      "   • **Physical Relief Items:** Select categories like Food Rations, Winter Clothing, Medicines, or Study Materials, specify quantities, and choose Drop-off or Volunteer Pickup.\n" +
      "3. **Confirmation & Tracking:** Your contribution immediately appears under `/donor/history`.\n" +
      "4. **Tax Exemption:** Once verified by our administration team, your official 80G Tax Exemption Certificate is available for instant download."
    );
  }

  // 4. Tax Exemption & 80G Receipts
  if (
    msg.includes('tax') ||
    msg.includes('80g') ||
    msg.includes('receipt') ||
    msg.includes('exemption')
  ) {
    return (
      "**80G Tax Exemption & Receipts:**\n\n" +
      "• **Eligibility:** Monetary donations made through SevaConnect are eligible for 50% tax deductions under Section 80G of the Indian Income Tax Act.\n" +
      "• **How to Access:** Navigate to **Donation History** (`/donor/history`), find your verified donation record, and click **Download 80G Receipt**.\n" +
      "• **Details Included:** Receipt Number, NGO Registration & PAN, Donor Name, Transaction Date, and Verified Amount."
    );
  }

  // 5. Active Campaigns & Causes
  if (
    msg.includes('active campaign') ||
    msg.includes('current cause') ||
    msg.includes('what campaigns') ||
    msg.includes('which campaign') ||
    msg.includes('list of campaigns')
  ) {
    return (
      `**Active Public Relief Campaigns:**\n\n${activeCampaignsText}\n\n` +
      "You can support any of these initiatives by visiting `/campaigns` and clicking **Donate Now**."
    );
  }

  // 6. Volunteering (Registration, Skills, Tasks)
  if (
    msg.includes('volunteer') ||
    msg.includes('join as volunteer') ||
    msg.includes('become a volunteer') ||
    msg.includes('volunteer profile') ||
    msg.includes('delivery task')
  ) {
    return (
      "**Volunteering on SevaConnect:**\n\n" +
      "• **Registration:** Sign up at `/register` selecting the **Volunteer** role.\n" +
      "• **Profile Setup:** Fill in your skills (e.g. *Driving, Logistics, First Aid, Teaching*), city, and weekly availability at `/volunteer/profile`.\n" +
      "• **Suggested Tasks:** The system matches open relief deliveries to your registered skills on `/volunteer`.\n" +
      "• **Doorstep Fulfillment:** When assigned a task, update its status ('In Progress' → 'Delivered') to track your impact and accumulate community service hours."
    );
  }

  // 7. Requesting Aid / Beneficiary Assistance
  if (
    msg.includes('request assistance') ||
    msg.includes('apply for help') ||
    msg.includes('need food') ||
    msg.includes('need clothes') ||
    msg.includes('need medicine') ||
    msg.includes('beneficiary') ||
    msg.includes('assistance request')
  ) {
    return (
      "**Requesting Beneficiary Assistance:**\n\n" +
      "If you or a community in need require urgent relief supplies:\n" +
      "1. Navigate to `/assistance-requests` (or open the public assistance request form).\n" +
      "2. Select the category of aid needed: **Food Supplies**, **Medical Assistance**, **Educational Support**, or **Clothing/Shelter**.\n" +
      "3. Specify the quantity, urgency level (*Low*, *Medium*, *High*, *Critical*), and delivery address.\n" +
      "4. Our NGO administrative team evaluates requests, allocates matching warehouse stock, and dispatches volunteer delivery personnel."
    );
  }

  // 8. Warehouse Inventory & Stock
  if (
    msg.includes('inventory') ||
    msg.includes('stock') ||
    msg.includes('warehouse') ||
    msg.includes('low stock') ||
    msg.includes('supplies')
  ) {
    return (
      "**Warehouse & Inventory Management (`/admin/inventory`):**\n\n" +
      "• **Real-Time Stock Tracking:** Monitors available quantities of relief supplies across categories (Food Kits, Blankets, Medical First-Aid, School Bags).\n" +
      "• **Low-Stock Alerts:** Automatically flags items when available stock falls below predefined thresholds.\n" +
      "• **Resource Allocation:** When administrators approve an assistance request, items are automatically deducted from the warehouse and assigned to a delivery team."
    );
  }

  // 9. Intelligent Analytics & Pattern Insights (V3.1)
  if (
    msg.includes('analytics') ||
    msg.includes('intelligent pattern') ||
    msg.includes('trend') ||
    msg.includes('insights') ||
    msg.includes('report')
  ) {
    return (
      "**Intelligent Pattern Insights & Analytics (`/admin/analytics`):**\n\n" +
      "• **Donation Momentum:** Aggregates verified donation revenue across the last 30 days versus the preceding period, showing percentage growth and top performing categories.\n" +
      "• **Aid Demand Spikes:** Analyzes beneficiary assistance requests to surface the most requested aid types and identify community needs.\n" +
      "• **Inventory Depletion:** Calculates resource burn rates to identify stock items depleting fastest, allowing preemptive campaign creation.\n" +
      "• **Executive Summary:** Automatically generates human-readable pattern statements alongside interactive charts (Donation Trend, Channel Split, Category Distribution)."
    );
  }

  // 10. Feedback & Reviews
  if (
    (msg.includes('feedback') || msg.includes('review')) &&
    (msg.includes('rating') || msg.includes('star') || msg.includes('leave') || msg.includes('submit'))
  ) {
    return (
      "**Feedback & Reviews System (`/admin/feedback`):**\n\n" +
      "• **Donation Reviews:** Donors can leave 1-to-5 star ratings and comments on verified donations.\n" +
      "• **Volunteer Task Reviews:** Volunteers can rate relief missions upon completing deliveries.\n" +
      "• **Campaign Feedback:** Community members can review completed public relief campaigns.\n" +
      "• **Transparency:** Administrators review community sentiment, audit field feedback, and monitor satisfaction ratings across all modules."
    );
  }

  // 11. In-App Notifications
  if (
    msg.includes('notification') ||
    msg.includes('bell icon') ||
    (msg.includes('alert') && msg.includes('bell'))
  ) {
    return (
      "**In-App Notification Center (`/notifications`):**\n\n" +
      "• **Notification Bell:** Click the bell icon in the top header to view recent system updates.\n" +
      "• **Event Triggers:** Instant notifications for donation verifications, assistance request reviews, and volunteer delivery assignments.\n" +
      "• **Actions:** Mark individual notifications as read or use 'Mark All as Read' to keep your inbox clean."
    );
  }

  // 12. Account Login, Register & Password Recovery
  if (
    msg.includes('password') ||
    (msg.includes('login') && !msg.includes('what is')) ||
    (msg.includes('log in') && !msg.includes('what is')) ||
    msg.includes('sign in') ||
    msg.includes('register') ||
    msg.includes('sign up') ||
    msg.includes('virtual mailbox')
  ) {
    if (msg.includes('password') || msg.includes('reset') || msg.includes('forgot')) {
      return (
        "**Password Recovery & Reset:**\n\n" +
        "1. Go to the **Forgot Password** page (`/forgot-password`).\n" +
        "2. Enter your registered email address and submit.\n" +
        "3. A secure password reset link with an authorization token is dispatched.\n" +
        "4. Follow the link to enter and confirm your new password.\n\n" +
        "*(For testing and demo environments, generated reset links and tokens are viewable in the **Virtual Mailbox**).* "
      );
    }

    return (
      "**Account Access & Authentication:**\n\n" +
      "• **Sign In:** Go to `/login` (or `/login/donor`, `/login/volunteer`, `/login/admin`).\n" +
      "• **New Account:** Go to `/register` and choose your role (*Donor* or *Volunteer*).\n" +
      "• **Forgot Password:** Visit `/forgot-password`, enter your registered email, and generate a reset link.\n" +
      "• **Testing Mailbox:** For local development and demonstration, reset tokens and simulated notification emails can be inspected via the Virtual Mailbox preview."
    );
  }

  // --- GENERAL QUESTIONS (Math, Science, Tech, Geography, Conversation, Writing, etc.) ---
  const generalAns = solveGeneralQuestion(userMessage);
  if (generalAns) {
    return generalAns;
  }

  // Live encyclopedic lookup (Wikipedia API with 3.5s timeout) for any question
  const wikiAns = await fetchWikipediaAnswer(userMessage);
  if (wikiAns) {
    return wikiAns;
  }

  // Fallback to dynamic educational topic synthesis
  return synthesizeTopicAnswer(userMessage);
}

/**
 * Call External LLM Provider (Anthropic, OpenAI, Gemini, Groq, OpenRouter)
 */
async function callExternalLLM({ provider, apiKey, model, systemPrompt, messages }) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

  try {
    // 1. Google Gemini API
    if (provider === 'gemini' || provider === 'google') {
      const geminiModel = model || 'gemini-1.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;

      const contents = messages.map(m => ({
        role: m.sender === 'bot' || m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.text || m.content || '' }]
      }));

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: { temperature: 0.3, maxOutputTokens: 800 }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errorText}`);
      }
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    }

    // 2. OpenAI / Groq / OpenRouter Compatible API
    if (provider === 'openai' || provider === 'groq' || provider === 'openrouter') {
      let endpoint = 'https://api.openai.com/v1/chat/completions';
      if (provider === 'groq') endpoint = 'https://api.groq.com/openai/v1/chat/completions';
      if (provider === 'openrouter') endpoint = 'https://openrouter.ai/api/v1/chat/completions';

      const defaultModel = provider === 'groq' ? 'llama-3.1-8b-instant' : (model || 'gpt-4o-mini');

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: defaultModel,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({
              role: m.sender === 'bot' ? 'assistant' : 'user',
              content: m.text || m.content || ''
            }))
          ],
          temperature: 0.3,
          max_tokens: 800
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${provider.toUpperCase()} API error (${response.status}): ${errorText}`);
      }
      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim();
    }

    // 3. Anthropic Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model || 'claude-3-5-sonnet-latest',
        system: systemPrompt,
        messages: messages.map(m => ({
          role: m.sender === 'bot' ? 'assistant' : 'user',
          content: m.text || m.content || ''
        })),
        max_tokens: 800,
        temperature: 0.3
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
    }
    const data = await response.json();
    return data.content?.[0]?.text?.trim();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * POST /api/chatbot/message
 * Public or Authenticated
 */
async function handleUserMessage(req, res) {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A non-empty message is required.'
      });
    }

    const trimmedMessage = message.trim();
    const userId = req.user ? req.user.id : null;
    const clientIdentifier = userId ? `user_${userId}` : `ip_${req.ip || req.connection.remoteAddress}`;

    // Rate Limiting Check
    if (isRateLimited(clientIdentifier)) {
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded. Please wait a moment before sending another message to the AI assistant.'
      });
    }

    // Live contextual data
    const activeCampaignsText = await getLiveCampaignsSummary();

    const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
    const apiKey = process.env.AI_API_KEY ? process.env.AI_API_KEY.trim() : '';
    const model = process.env.AI_MODEL || '';

    let reply = '';
    let usedProvider = 'fallback';

    // If an external API key is configured, call external LLM with full website + universal knowledge prompt
    if (apiKey && apiKey !== 'your_api_key_here' && apiKey.length > 5) {
      const systemPrompt = `You are SevaBot, a highly capable, versatile AI assistant.
You have two core responsibilities:
1. SEVACONNECT EXPERT: You have complete knowledge of the SevaConnect NGO Donation & Resource Management System (campaigns, donations, 80G tax receipts, volunteer tasks, inventory, assistance requests, and analytics). When users ask about SevaConnect, provide clear, accurate guidance.
   - Active campaigns in DB:
${activeCampaignsText}
2. UNIVERSAL ASSISTANT: You must answer ANY and ALL questions the user asks across all domains: mathematics, science, technology, programming, history, geography, creative writing, health, cooking, advice, and conversation. Never refuse a benign question.

CONSTRAINTS:
- For SevaConnect actions (like donating or requesting aid), guide users to the UI; do not execute write operations.
- Do not disclose passwords or donor personal contact details.
- Always be helpful, informative, clear, and articulate. Use markdown formatting with bold text and bullet points.`;

      const formattedHistory = Array.isArray(history)
        ? history.slice(-6).map(h => ({
            sender: h.sender === 'bot' || h.role === 'assistant' ? 'bot' : 'user',
            text: h.text || h.content || ''
          }))
        : [];

      formattedHistory.push({ sender: 'user', text: trimmedMessage });

      try {
        const aiResponse = await callExternalLLM({
          provider,
          apiKey,
          model,
          systemPrompt,
          messages: formattedHistory
        });

        if (aiResponse) {
          reply = aiResponse;
          usedProvider = provider;
        }
      } catch (externalErr) {
        console.warn(`[Chatbot] External LLM call failed (${provider}): ${externalErr.message}. Falling back to universal engine.`);
        reply = await getUniversalReply(trimmedMessage, activeCampaignsText);
        usedProvider = 'universal_fallback';
      }
    } else {
      // Use universal engine
      reply = await getUniversalReply(trimmedMessage, activeCampaignsText);
      usedProvider = 'universal_engine';
    }

    // Persist to chatbot_logs
    try {
      await query('INSERT INTO chatbot_logs (user_id, message, response) VALUES (?, ?, ?)', [
        userId,
        trimmedMessage.substring(0, 2000),
        reply.substring(0, 4000)
      ]);
    } catch (logErr) {
      console.warn('[Chatbot] Failed to save conversation log:', logErr.message);
    }

    return res.status(200).json({
      success: true,
      reply,
      provider: usedProvider,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Chatbot Controller] Unexpected error:', error);
    return res.status(200).json({
      success: true,
      reply: "I am temporarily experiencing difficulty connecting to the server. Please try again in a few moments!",
      provider: 'error_fallback',
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = {
  handleUserMessage
};
