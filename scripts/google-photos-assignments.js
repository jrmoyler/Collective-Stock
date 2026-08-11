const assignments = new Map();

function add(indexes, division, category, baseTitle, extra = {}) {
  const list = Array.isArray(indexes) ? indexes : [indexes];
  list.forEach((albumIndex, position) => {
    if (assignments.has(albumIndex)) throw new Error(`Duplicate Google Photos assignment for album index ${albumIndex}`);
    assignments.set(albumIndex, {
      division,
      category,
      title: list.length > 1 ? `${baseTitle} ${String(position + 1).padStart(2, "0")}` : baseTitle,
      ...extra
    });
  });
}

function named(indexes, division, baseTitle) {
  add(indexes, division, "Stock Images", baseTitle, { deriveTitleFromFilename: true });
}

named([1, 2, 3, 4, 5, 6, 7, 8, 9, 13], "Collective AI Inc", "Collective AI Stock");
named([15, 16, 17, 34, 35, 37, 41, 42, 43, 46], "Terra Axis", "Terra Axis Stock");
named([18, 19, 23, 27, 28, 29, 31, 32, 38, 66], "Vital Helix", "Vital Helix Stock");

const curatedStockTitles = [
  [10, "ZenFlow", "Luminous Intelligence Portal"],
  [14, "ZenFlow", "Architectural Intelligence Medallion"],
  [22, "ZenFlow", "ZenFlow Gallery Threshold"],
  [24, "ZenFlow", "Moonlit Digital Meditation"],
  [25, "ZenFlow", "River of Neural Light"],
  [26, "ZenFlow", "Orbital Intelligence Seal"],
  [36, "ZenFlow", "Holographic Balance Meditation"],
  [39, "ZenFlow", "Connected Intelligence Globe"],
  [49, "ZenFlow", "Agent Lattice Tree"],
  [55, "ZenFlow", "ZenFlow Visual Collection"],
  [12, "Binary Loom", "Holographic Cloud Circuit Emblem"],
  [20, "Binary Loom", "Cloud Network over City"],
  [21, "Binary Loom", "Secure Code Shield"],
  [30, "Binary Loom", "Flowing Binary Data Wave"],
  [33, "Binary Loom", "Developer Workstation and Code"],
  [40, "Binary Loom", "Luminous Processor Core"],
  [44, "Binary Loom", "Transparent Circuit Module"],
  [45, "Binary Loom", "Binary Data Corridor"],
  [52, "Binary Loom", "Fiber Data Streams"],
  [65, "Binary Loom", "Binary Loom Visual Collection"],
  [89, "Vector Shift", "Pixel-Shift Eagle Emblem"],
  [92, "Vector Shift", "Forward Momentum Portal"],
  [104, "Vector Shift", "High-Speed Data Corridor"],
  [107, "Vector Shift", "Accelerated Future Gateway"],
  [108, "Vector Shift", "Vector Shift Operations Center"],
  [121, "Vector Shift", "Digital Eagle Brand Poster"],
  [122, "Vector Shift", "Global Velocity Dashboard"],
  [126, "Vector Shift", "Connected World Momentum"],
  [127, "Vector Shift", "Precision Gear Drive"],
  [129, "Vector Shift", "Metropolitan Velocity Light Trails"],
  [98, "Nomad Nexus", "Remote Work from Coastal Retreat"],
  [101, "Nomad Nexus", "Global Travel Network Globe"],
  [105, "Nomad Nexus", "Mobile Travel Analytics"],
  [109, "Nomad Nexus", "Global Access Pass"],
  [116, "Nomad Nexus", "Nomad Nexus Mobile Companion"],
  [117, "Nomad Nexus", "Distributed Team Workspace"],
  [118, "Nomad Nexus", "Global Airport Departure"],
  [119, "Nomad Nexus", "Sunset Remote Work Overlook"],
  [120, "Nomad Nexus", "Connected Travel Expedition"],
  [128, "Nomad Nexus", "Nomad Nexus Visual Collection"]
];
curatedStockTitles.forEach(([index, division, title]) => add(index, division, "Stock Images", title, { confidence: "high" }));

add(11, "Collective AI Inc", "Videos", "Misty Green Mountain Flyover", { confidence: "high", classification: "general-stock" });
add(59, "Collective AI Inc", "Videos", "Storm over Golden Fields", { confidence: "high", classification: "general-stock" });

const rows = `
47|Vector Shift|Hero Images|Autonomous Rover at Industrial Site|medium
48|Quantum Ledger|Hero Images|Quantum Vault Access|high
50|Animus Prime|Stock Images|Humanoid Robotics Operations Center|medium
51|Quantum Ledger|Hero Images|Data-Wrapped Ledger Pillar|high
53|Vector Shift|Stock Images|Autonomous Warehouse Fleet|high
54|Quantum Ledger|Stock Images|Quantum Ledger Mobile App|high
56|Quantum Ledger|Stock Images|Quantum Data Center|medium
57|Animus Prime|Stock Images|Robotic Interface Touch|medium
58|Animus Prime|Hero Images|Industrial Mech in Hangar|high
60|Quantum Ledger|Stock Images|Global Ledger Operations Center|medium
61|Animus Prime|Stock Images|Humanoid Systems Calibration|high
62|Civic Core|Stock Images|Community Impact Dashboard|high
63|Animus Prime|Stock Images|Humanoid Robot in Lab|high
64|Quantum Ledger|Hero Images|Quantum Core Vault|high
67|Quantum Ledger|Hero Images|Quantum Ledger Token|high
68|Animus Prime|Hero Images|Human–AI Connection|high
69|Civic Core|Hero Images|Digital Civic Services Network|high
70|Civic Core|Stock Images|Civic Services Mobile App|high
71|Animus Prime|Hero Images|Advanced Female Android|high
72|Quantum Ledger|Hero Images|Global Ledger Network Skyline|medium
73|Quantum Ledger|Stock Images|Quantum Ledger Executive Boardroom|high
74|Civic Core|Stock Images|Civic Smart-City Campus|high
75|Aether Link|Stock Images|Aether Link Strategy Room|high
76|Civic Core|Stock Images|Civic Core Team Collaboration|high
77|Aether Link|Stock Images|Aether Link Network Dashboard|high
78|Civic Core|Stock Images|Civic Core Innovation Lobby|high
79|Signal Velocity|Website Backgrounds|High-Velocity Data Stream|high
80|Signal Velocity|Hero Images|Signal Horizon Summit|medium
81|Quantum Ledger|Stock Images|Quantum Ledger Executive Analytics|high
82|Civic Core|Stock Images|Civic Planning Workshop|high
83|Signal Velocity|Stock Images|Global Signal Operations Center|medium
84|Aether Link|Hero Images|Connected City at Dusk|medium
85|Aether Link|Stock Images|Global Network Strategy Room|medium
86|Civic Core|Stock Images|Civic Core Town Hall|high
87|Aether Link|Hero Images|Aether Link AI Operations|high
88|Civic Core|Stock Images|Civic Services Help Desk|high
90|Aether Link|Stock Images|Connected Home Network|high
91|Obsidian Arc|Stock Images|Secure Mobile Console|high
93|Signal Velocity|Hero Images|Satellite Relay at Sunset|high
94|Animus Prime|Hero Images|Human–AI Interface Touch|high
95|Signal Velocity|Hero Images|Global Satellite Relay Array|high
96|Signal Velocity|Hero Images|Signal Velocity Smart City|high
97|Obsidian Arc|Stock Images|Biometric Access Control|high
99|Signal Velocity|Website Backgrounds|Signal Wave Network|high
100|Obsidian Arc|Hero Images|Secure Facility Digital Twin|high
102|Aether Link|Hero Images|Global Aether Network|medium
103|Obsidian Arc|Website Backgrounds|Security Mesh|high
106|Obsidian Arc|Stock Images|Threat Operations Map|medium
110|Signal Velocity|Hero Images|High-Speed Connected City|high
111|Aether Link|Stock Images|Aether Link Operations Center|high
112|Aether Link|Hero Images|Aether Link Social Network|high
113|Obsidian Arc|Stock Images|Headquarters Lobby|high
114|Aether Link|Hero Images|Edge-Cloud Hardware|high
115|Obsidian Arc|Stock Images|Secure Surveillance Corridor|high
123|Obsidian Arc|Stock Images|Security Operations Center|high
124|Aether Link|Website Backgrounds|Aether Network Starfield|low
125|Animus Prime|Stock Images|Human–Robot Collaboration|high
130|Gaia Synthesis|Website Backgrounds|Eco-Circuit Blueprint|medium
131|Vital Helix|Website Backgrounds|Molecular Hex Grid|medium
132|Aether Link|Stock Images|Global Signal Radar|medium
133|Vital Helix|Stock Images|Bio-Neural Spiral|high
134|Nexus Labs|Stock Images|Holographic Research Orb|high
135|Obsidian Arc|Website Backgrounds|Obsidian Circuit Panels|high
136|Animus Prime|Stock Images|Autonomous Street Robot|high
137|The Collective|Stock Images|Collaborative Strategy Session|high
138|Animus Prime|Website Backgrounds|Synthetic Geometry Field|medium
139|Civic Core|Stock Images|Civic Forum on the Steps|high
140|Terra Axis|Website Backgrounds|Geospatial Data Mesh|medium
141|Binary Loom|Website Backgrounds|Binary Particle Matrix|high
142|Binary Loom|Stock Images|Digital Data Weave|high
143|Signal Velocity|Website Backgrounds|Flowing Signal Terrain|medium
144|Terra Axis|Stock Images|Coastal Geospatial Corridor|high
145|Animus Prime|Stock Images|Humanoid Systems Profile|high
146|Kinetic Edge|Website Backgrounds|Kinetic Diagonal Streaks|high
147|Quantum Ledger|Website Backgrounds|Fintech Growth Circuitry|medium
148|Signal Velocity|Website Backgrounds|Signal Routing Blueprint|medium
149|Quantum Ledger|Stock Images|Institutional Digital Assets|high
150|Juris Guard|Website Backgrounds|Legal Shield and Scales|high
151|Cognara Mind|Stock Images|Cognitive Learning Consultation|high
152|Gaia Synthesis|Stock Images|Regenerative Terraces and Data Streams|high
153|Kinetic Edge|Stock Images|Energy-Tracked Athlete|high
154|Animus Prime|Stock Images|AI Operations Assistant|high
155|Aether Link|Website Backgrounds|Constellation Link Network|high
156|Cognara Mind|Stock Images|Neural Fiber Lattice|high
157|Obsidian Arc|Website Backgrounds|Obsidian Isometric Grid|high
158|Obsidian Arc|Stock Images|Obsidian Crystal Arc|high
159|Signal Velocity|Stock Images|Accelerated Particle Stream|high
160|Binary Loom|Stock Images|Distributed Data Cubes|medium
161|Civic Core|Stock Images|Connected Civic Skyline|high
162|Aether Link|Website Backgrounds|Global Link Graph|medium
163|Juris Guard|Website Backgrounds|Twin Compliance Shields|high
164|Signal Velocity|Stock Images|Holographic Signal Wave|high
165|Aether Link|Website Backgrounds|Aether Constellation Mesh|medium
166|Juris Guard|Stock Images|Urban Legal Protection|high
167|Cognara Mind|Website Backgrounds|Neural Synapse Network|high
168|Vital Helix|Website Backgrounds|Genomic Network Blueprint|high
169|Terra Axis|Stock Images|Autonomous Survey Drones|medium
170|Cognara Mind|Stock Images|Cognitive Risk Consultation|high
171|Cognara Mind|Stock Images|Cognitive Analytics Workspace|high
172|Vital Helix|Stock Images|Genomic Double Helix|high
173|Cognara Mind|Stock Images|Mental Wellness Shield|high
174|Cognara Mind|Stock Images|Collaborative Brain Mapping|high
175|Cognara Mind|Stock Images|Desktop Neural Hologram|high
176|Cognara Mind|Stock Images|Cognitive Interface Workbench|high
177|Eon Core|Hero Images|The Timekeeper’s Hall|high
178|Cognara Mind|Stock Images|Human Network Intelligence Wall|high
179|Cognara Mind|Stock Images|Cognitive Signals Dashboard|high
180|Aether Link|Website Backgrounds|Constellation Link Grid|medium
181|Cognara Mind|Stock Images|Mobile Cognitive Metrics|high
182|Cognara Mind|Stock Images|Personal Neuro-Wellness Profile|medium
183|Cognara Mind|Stock Images|Neural Vitality Pulse|high
184|Cognara Mind|Stock Images|Cognitive Analytics Laptop|high
185|Eon Core|Hero Images|Infinite Time Archive|high
186|Cognara Mind|Stock Images|Protected Mind Profile|high
187|Cognara Mind|Stock Images|Neural Focus Meditation|high
188|Eon Core|Hero Images|Time Exchange Chamber|high
189|Eon Core|Hero Images|Hourglass Observatory|high
190|Cognara Mind|Stock Images|Cognitive Research Review|high
191|Cognara Mind|Stock Images|Mind Network Analysis|high
192|Cognara Mind|Stock Images|Neuro-Digital Identity|high
193|Eon Core|Hero Images|Monumental Eon Hourglass|high
194|Juris Guard|Reference Images|Juris Guard Brand Systems Desk|high
195|Nexus Labs|Hero Images|Nexus Energy Containment Chamber|high
196|Cognara Mind|Stock Images|Personal Mind Analytics|high
197|Hybrid Living|Stock Images|Hybrid Sunset Workday|medium
198|Eon Core|Hero Images|Branching Timeline Engine|high
199|Juris Guard|Reference Images|Juris Guard Operations Center|high
200|Cognara Mind|Stock Images|Neural Jellyfish Hologram|high
201|Nexus Labs|Hero Images|Nexus Holographic Core Chamber|high
202|Nexus Labs|Reference Images|Nexus Portal Emblem|high
203|Cognara Mind|Stock Images|Cognitive Pulse|high
204|Nexus Labs|Hero Images|Nexus Signal Horizon|high
205|Juris Guard|Reference Images|Juris Guard Boardroom|high
206|Nexus Labs|Hero Images|Nexus Monumental Portal|high
207|Nexus Labs|Hero Images|Nexus Containment Capsule|high
208|Nexus Labs|Hero Images|Nexus Research Console|high
209|Juris Guard|Reference Images|Digital Justice Shield at the Civic Court|high
210|Hybrid Living|Stock Images|Hybrid Living Strategy Meeting|medium
211|Nexus Labs|Reference Images|Nexus Crystal Mark|high
212|Nexus Labs|Hero Images|Nexus Holographic Lab|high
213|Nexus Labs|Hero Images|Nexus Global Core|high
214|Nexus Labs|Hero Images|Nexus Gateway Installation|high
215|Nexus Labs|Hero Images|Nexus Artifact Pedestal|high
216|Nexus Labs|Hero Images|Nexus Immersive Corridor|high
217|Juris Guard|Reference Images|Juris Guard Case Analysis|high
218|Nexus Labs|Hero Images|Nexus Prototype Lab|high
219|Eon Core|Hero Images|Eon Archive Core|high
220|Hybrid Living|Stock Images|Connected Home Control|high
221|Juris Guard|Reference Images|Juris Guard Executive Office|high
222|ZenFlow|Stock Images|Sunset Flow Session|high
223|Juris Guard|Reference Images|Juris Guard Casefile Suite|high
224|Hybrid Living|Stock Images|Flexible Workday in Glass Office|medium
225|Collective AI Inc|Hero Images|Collective AI Core Systems Corridor|high
226|Nexus Labs|Hero Images|Nexus Hologram Stage|high
227|Hybrid Living|Stock Images|After-Hours Home Office|high
228|The Collective|Stock Images|Collaborative Team Roundtable|high
229|Nexus Labs|Hero Images|Nexus Global Network|high
230|Nexus Labs|Hero Images|Nexus Data Portal|high
231|The Collective|Stock Images|Holographic City Strategy Session|medium
232|Nexus Labs|Hero Images|Nexus Data Console|medium
233|The Collective|Stock Images|Global Executive Boardroom|high
234|Eon Core|Hero Images|Temporal Archive Hourglass|high
235|Nexus Labs|Hero Images|Nexus Data Monolith|high
236|The Collective|Hero Images|Collective Growth Mark|high
237|The Collective|Stock Images|Executive City Review|high
238|Cognara Mind|Hero Images|Augmented Thought Profile|high
239|The Collective|Stock Images|Multi-Device Analytics Suite|medium
240|Juris Guard|Stock Images|AI Legal Counsel Briefing|high
241|The Collective|Stock Images|Operations-Wall Collaboration|high
242|Hybrid Living|Stock Images|Open Coworking Session|high
243|Nexus Labs|Hero Images|Quantum Cube Stage|high
244|Hybrid Living|Stock Images|Connected-Home Mobile Check-In|medium
245|Juris Guard|Hero Images|Circuit Crest of Digital Justice|high
246|The Collective|Hero Images|Collective Intelligence Command Room|high
247|The Collective|Stock Images|Community Dinner|medium
248|Hybrid Living|Stock Images|Couple Working from Home|high
249|Juris Guard|Stock Images|Mobile Legal Workspace|high
250|The Collective|Hero Images|Collective Analytics War Room|high
251|The Collective|Stock Images|Friends Around the Table|medium
252|Hybrid Living|Stock Images|Evening Coworking Lounge|medium
253|Nomad Nexus|Stock Images|Rooftop Remote Work Abroad|high
254|The Collective|Hero Images|Collective Operations Desk|high
255|The Collective|Stock Images|Analytics Team Briefing|high
256|Gaia Synthesis|Hero Images|Smart Irrigation Valley|high
257|The Collective|Hero Images|Immersive Data Theater|high
258|The Collective|Hero Images|Holographic Strategy Desk|high
259|Collective AI Inc|Hero Images|Human Vision at the Summit|high
260|The Collective|Stock Images|Solo Executive Analytics Room|medium
261|Gaia Synthesis|Hero Images|Networked Dew Leaf|high
262|Gaia Synthesis|Stock Images|Automated Vertical Farm|high
263|The Collective|Stock Images|City Simulation Boardroom|high
264|The Collective|Hero Images|Global Intelligence Hub|high
265|The Collective|Hero Images|Collective Control Suite|high
266|Gaia Synthesis|Stock Images|Plant Science Laboratory|high
267|Gaia Synthesis|Stock Images|Renewable Smart Agriculture|high
268|The Collective|Website Backgrounds|Collective Core Mark|high
269|Gaia Synthesis|Stock Images|Restored Wetland Sunrise|high
270|The Collective|Hero Images|Enterprise Control Floor|high
271|Collective AI Inc|Hero Images|Connected Earth at Night|high
272|ZenFlow|Stock Images|Rooftop Group Yoga|high
274|Collective AI Inc|Hero Images|Human–Machine Contact Interface|high
275|Hybrid Living|Stock Images|Remote Work by the Window|high
277|Gaia Synthesis|Stock Images|Smart-Farm Field Analyst|high
279|Gaia Synthesis|Hero Images|Seedling in the Data Web|high
282|Gaia Synthesis|Stock Images|Forest Drone Survey|high
284|Signal Velocity|Website Backgrounds|Urban Data Acceleration|high
285|The Collective|Stock Images|Glass-Walled Data Team|high
287|Gaia Synthesis|Stock Images|Drone Precision Agriculture|high
289|Gaia Synthesis|Stock Images|Botanical Research Station|high
290|Gaia Synthesis|Hero Images|Connected Leaf Macro|high
291|Gaia Synthesis|Stock Images|Regenerative River Farm|high
292|Cognara Mind|Hero Images|Dual Neural Convergence|high
293|Quantum Ledger|Website Backgrounds|Rising Market Signal|medium
295|Terra Axis|Hero Images|Regenerative Future City|high
301|Signal Velocity|Hero Images|Multichannel Operations Studio|high
302|Aether Link|Hero Images|Deep-Space Radio Array|high
306|Terra Axis|Hero Images|Sustainable Terrace City|high
313|Collective AI Inc|Reference Images|Division Visual-Language Moodboard|high|cross-division
317|Collective AI Inc|Videos|Breakthrough Light over Mountains|high|general-stock
319|Collective AI Inc|Videos|Volumetric Light Portal|high|general-stock
326|Cognara Mind|Hero Images|Haloed Intelligence Profile|high
327|Signal Velocity|Website Backgrounds|Streaming Signal Waves|medium
328|Cognara Mind|Reference Images|Dual-Energy Thoughtforms|low
329|Gaia Synthesis|Hero Images|Seedling in Caring Hands|high
330|Obsidian Arc|Hero Images|Tactical Security Corridor|high
`;

for (const line of rows.trim().split("\n")) {
  const [index, division, category, title, confidence, classification] = line.split("|");
  add(Number(index), division, category, title, { confidence, classification });
}

// Standalone WhatsApp stock series have no division marks and are deliberately
// kept outside division galleries. The Animals / General Stock boundary was
// verified from the source pixels, not inferred from the previous folder.
add([273, 281, 314, 323], "Collective AI Inc", "Reference Images", "Dustworld Astronaut", { confidence: "high", classification: "general-stock" });
add([276, 288, 312], "Collective AI Inc", "Reference Images", "Lion at Dawn", { confidence: "high", classification: "animal-stock" });
add([278, 297, 307, 310], "Collective AI Inc", "Reference Images", "Wildflower Contemplation", { confidence: "high", classification: "general-stock" });
add([280, 296, 315, 324], "Collective AI Inc", "Reference Images", "Predator Confrontation", { confidence: "high", classification: "animal-stock" });
add([283, 305, 308], "Collective AI Inc", "Reference Images", "Running Leopard", { confidence: "high", classification: "animal-stock" });
add(286, "Collective AI Inc", "Hero Images", "Modular Glass Habitat", { confidence: "high", classification: "general-stock" });
add([294, 309, 318], "Collective AI Inc", "Reference Images", "Neon Motorcycle Run", { confidence: "high", classification: "general-stock" });
add([298, 311, 321, 322], "Collective AI Inc", "Reference Images", "Luminous Bio-Tree", { confidence: "high", classification: "general-stock" });
add([299, 304, 325], "Collective AI Inc", "Reference Images", "Neon City Corridor", { confidence: "high", classification: "general-stock" });
add([300, 303, 316, 320], "Collective AI Inc", "Reference Images", "Liquid Horse Study", { confidence: "high", classification: "animal-stock" });

const expected = Array.from({ length: 330 }, (_, index) => index + 1);
const missing = expected.filter((index) => !assignments.has(index));
if (missing.length) throw new Error(`Missing Google Photos assignments: ${missing.join(", ")}`);
if (assignments.size !== 330) throw new Error(`Expected 330 Google Photos assignments, found ${assignments.size}`);

export function googlePhotosAssignment(albumIndex) {
  return structuredClone(assignments.get(albumIndex));
}

export const googlePhotosAssignmentCount = assignments.size;
