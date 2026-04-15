# Implementation Tasks: Feature Engineering
## Root Project Feature Integration

**Status:** Phase 1 COMPLETE, Phase 2 IN PROGRESS  
**Date Started:** April 14, 2026  
**Objective:** Add Learn Law, Interview Simulator, and Medical Consulting features to the root project (frontend and backend) following the patterns from ref_vr_project/NoDiscord, using PreBuildAgents.js data.

---

## 📋 Tasks Overview

### Phase 1: Frontend Navigation & Pages (✅ COMPLETE)
- [x] **Task 1.1:** Add three new debate modes to sidebar
  - File: `frontend/src/components/Sidebar.jsx` ✅ DONE
  - Added three modes to NAV_ITEMS array with isMode: true:
    - "learn-law" → Learn Indian Laws (BookOpen icon)
    - "interview-simulator" → Interview Simulator (Briefcase icon)
    - "medical-consulting" → Medical Consulting (Stethoscope icon)
  - These now appear in the "Debate Modes" section alongside existing modes
  
- [x] **Task 1.2:** Create LearnLawPage component
  - File: `frontend/src/components/LearnLawPage.jsx` ✅ DONE (300 lines)
  - Features:
    - Input legal topic ✅
    - Generate panel with law_makers agents from PreBuildAgents.js ✅
    - Display judges/legal experts with selection checkboxes ✅
    - Start debate session with selected experts ✅
  - Agents to use: law_makers array (Dr. B.R. Ambedkar, Fali Sam Nariman, etc.) ✅

- [x] **Task 1.3:** Create InterviewSimulatorPage component
  - File: `frontend/src/components/InterviewSimulatorPage.jsx` ✅ DONE (280 lines)
  - Features:
    - Select interview type (tech, HR, startup pitch, case study, management) ✅
    - Generate interviewer panel ✅
    - Display interviewers with selection ✅
    - Start interview session ✅
  - Agents to use: interview_panel array (Priya Sharma, Marcus Chen, Rahul Nair, etc.) ✅

- [x] **Task 1.4:** Create MedicalConsultingPage component
  - File: `frontend/src/components/MedicalConsultingPage.jsx` ✅ DONE (320 lines)
  - Features:
    - Input medical case description ✅
    - Generate medical consultation panel ✅
    - Display doctors/specialists with selection ✅
    - Start consultation session ✅
  - Agents to use: medical_specialists array (Dr. Devi Prasad Shetty, Dr. Siddhartha Mukherjee, etc.) ✅

- [x] **Task 1.5:** Update root App.jsx
  - File: `frontend/src/App.jsx` ✅ DONE
  - Added imports for three feature pages ✅
  - Added onFeatureSelect handler ✅
  - Added handleSelectExperts, handleSelectInterviewers, handleSelectDoctors handlers ✅
  - Added conditional rendering for feature pages based on activeTab ✅
  - Feature pages render when: activeTab === "learn-law", "interview-simulator", "medical-consulting" ✅
  - Connected feature callbacks to toggleMember for team selection ✅

### Phase 2: Backend Routes & Services (NEXT)
- [ ] **Task 2.1:** Create feature routes file
  - File: `backend/routes/features.routes.js`
  - Endpoints:
    - `POST /features/generate-law-panel` - Generate legal panel from topic
    - `POST /features/generate-interview-panel` - Generate interviewer panel
    - `POST /features/generate-medical-panel` - Generate medical panel

- [ ] **Task 2.2:** Create feature service functions
  - File: `backend/services/featuresService.js`
  - Functions:
    - `generateLawPanel(topic)` - Filter law_makers agents by relevance
    - `generateInterviewPanel(scenario)` - Filter interview_panel agents by match
    - `generateMedicalPanel(medicalCase)` - Filter medical_specialists by relevance

- [ ] **Task 2.3:** Update server.js to use features routes
  - File: `backend/server.js`
  - Add: `app.use('/api/features', featuresRoutes)`

### Phase 3: Data Mapping (✅ COMPLETE)
- [x] **Task 3.1:** Review PreBuildAgents.js structure
  - law_makers: 8 agents (Ambedkar, Nariman, Palkhivala, etc.) ✅
  - interview_panel: 6 agents (Priya, Marcus, Anjali, Rahul, Arjun, Sophia) ✅
  - medical_specialists: 10 agents (Dr. Shetty, Dr. Mukherjee, Dr. Carson, etc.) ✅
  - historians: 7 agents (for historical debates)
  - business_men: 10 agents (entrepreneurs/CEOs)
  - world_leaders: 15 agents (political leaders)

### Phase 4: Integration & Testing (IN PROGRESS)
- [x] **Task 4.1:** Test feature navigation
  - Feature buttons in Sidebar now clickable ✅
  - activeTab changes on feature click ✅
  - Pending: Full E2E testing
- [ ] **Task 4.2:** Test agent selection and filtering
- [ ] **Task 4.3:** Test session start with selected agents

---

## 📁 Files to be Created/Modified

### Created Files:
1. `frontend/src/components/LearnLawPage.jsx` - ✅ 300 lines
2. `frontend/src/components/InterviewSimulatorPage.jsx` - ✅ 280 lines
3. `frontend/src/components/MedicalConsultingPage.jsx` - ✅ 320 lines
4. `backend/routes/features.routes.js` - ⏳ 80 lines (NEXT)
5. `backend/services/featuresService.js` - ⏳ 200 lines (NEXT)

### Modified Files:
1. `frontend/src/components/Sidebar.jsx` - ✅ DONE
   - Added BookOpen, Briefcase, Stethoscope icons
   - Added FEATURE_ITEMS array
   - Added onFeatureSelect prop
   - Added Features section to nav
2. `frontend/src/App.jsx` - ✅ DONE
   - Added imports for three feature pages
   - Added feature selection handlers
   - Added feature page conditional rendering
3. `backend/server.js` - ⏳ NEXT (Register features routes)

### Existing Files Used (No Changes):
1. `backend/PreBuildAgents.js` - Data source for all agents
2. `frontend/src/lib/api.js` - API utility (may need small additions)

---

## 🔗 Agent Mapping

### Learn Law Feature
**Source:** `law_makers` array from PreBuildAgents.js
- Dr. B.R. Ambedkar - Constitutional law
- Alladi Krishnaswami Ayyar - Fundamental rights
- T.T. Krishnamachari - Economic constitution
- Granville Austin - Constitutional history
- Fali Sam Nariman - Supreme Court advocacy
- Nani Ardeshir Palkhivala - Constitutional defense
- Dr. Rajendra Prasad - Constitutional process
- Justice P.N. Bhagwati - Public interest litigation

### Interview Simulator Feature
**Source:** `interview_panel` array from PreBuildAgents.js
- Priya Sharma - Technical interviewer (DSA, system design)
- Marcus Chen - Engineering manager (leadership assessment)
- Anjali Verma - HR business partner (culture fit)
- Dr. Rahul Nair - System design specialist
- Arjun Mehta - CS student perspective (fresher round)
- Sophia Reeves - ML engineer interviewer

### Medical Consulting Feature
**Source:** `medical_specialists` array from PreBuildAgents.js
- Dr. Devi Prasad Shetty - Cardiac surgeon
- Dr. Paul Broca - Neurosurgeon
- Dr. Ben Carson - Paediatric neurosurgeon
- Dr. Siddhartha Mukherjee - Oncologist
- Dr. Christiaan Barnard - Cardiac surgeon
- Dr. Henry Marsh - Brain tumour specialist
- Dr. Jane Cooke Wright - Chemotherapy pioneer
- Dr. Govind Mital - Orthopaedic surgeon
- Dr. Oliver Sacks - Neurologist
- Dr. Denis Mukwege - Gynaecological surgeon

---

## 🏗️ Architecture Pattern

Each feature follows this pattern (from NoDiscord):

```
USER INPUT (topic/case/scenario)
    ↓
GENERATE PANEL (filter agents by relevance from PreBuildAgents.js)
    ↓
DISPLAY AGENTS (show with checkboxes for selection)
    ↓
SELECT AGENTS (user picks which expert to include)
    ↓
START SESSION (create debate/session with selected agents)
    ↓
REDIRECT TO DEBATE PAGE (reuse existing debate UI)
```

---

## 💾 Backend Implementation Details

### featuresService.js Functions

#### 1. generateLawPanel(topic)
- Input: Legal topic string
- Logic: 
  - Calculate relevance score for each law_makers agent
  - Keywords: constitutional, rights, judicial, legal, court, crime, property, family, tax, contract
  - Return top 3-4 judges and 3-4 advocates/scholars
- Output: `{ judges: [...], advocates: [...] }`

#### 2. generateInterviewPanel(scenario)
- Input: Interview scenario (tech, hr, startup, case-study, management)
- Logic:
  - Map scenario to agent skillsets
  - tech → Priya Sharma, Dr. Rahul Nair, Arjun Mehta
  - hr → Marcus Chen, Anjali Verma
  - startup → Priya Sharma, Marcus Chen
  - case-study → Dr. Rahul Nair, Marcus Chen
  - management → Marcus Chen, Anjali Verma
- Output: `{ interviewers: [...] }`

#### 3. generateMedicalPanel(medicalCase)
- Input: Medical case description
- Logic:
  - Detect case keywords: cardiac, neuro, cancer, surgery, tumor, mental, respiratory, gastrointestinal
  - Filter medical_specialists by expertise match
  - Return diverse specialties (primary + 1-2 supporting)
- Output: `{ doctors: [...], specialists: [...] }`

---

## 🔄 API Endpoints

### Existing Root Project API
- `/agent/suggest` (POST) - Already exists for topic-based suggestions
- The system uses `useAppStore` for state management

### New Endpoints to Add
- `POST /api/features/law-panel` - Generate law experts panel
- `POST /api/features/interview-panel` - Generate interview panel
- `POST /api/features/medical-panel` - Generate medical panel

### Alternative: Reuse Existing `/agent/suggest`
Could use existing `/agent/suggest` endpoint with a mode parameter:
- `/agent/suggest?mode=law`
- `/agent/suggest?mode=interview`
- `/agent/suggest?mode=medical`

---

## 📝 Implementation Checklist

### Frontend
- [ ] Create navbar with features dropdown (matching root project style)
- [ ] LearnLawPage component with full UX
- [ ] InterviewSimulatorPage component with full UX
- [ ] MedicalConsultingPage component with full UX
- [ ] Route integration in App.jsx
- [ ] API calls to backend (or reuse existing `/agent/suggest`)

### Backend
- [ ] Create features.routes.js
- [ ] Create featuresService.js with 3 service functions
- [ ] Register routes in server.js
- [ ] Test endpoints with sample inputs

### Integration
- [ ] Ensure agent data flows correctly from PreBuildAgents.js
- [ ] Test navigation to new pages
- [ ] Test agent selection workflow
- [ ] Test session start with selected agents

---

## 🚧 PROGRESS UPDATE (Latest - Modes Implementation)

### ✅ PHASE 1: FRONTEND COMPLETE
All frontend components are now fully implemented and integrated as new debate modes:

1. **LearnLawPage.jsx** (300 lines) ✅
   - Renders when `gameState.mode === "learn-law"`
   - Legal topic input and example buttons
   - Relevance scoring for law_makers agents
   - Selection checkboxes and start session button
   - onSelectExperts callback with agent IDs

2. **InterviewSimulatorPage.jsx** (280 lines) ✅
   - Renders when `gameState.mode === "interview-simulator"`
   - Interview type selection (6 scenario types)
   - Scenario-to-interviewer mapping logic
   - Selection checkboxes and start interview button
   - onSelectInterviewers callback with agent IDs

3. **MedicalConsultingPage.jsx** (320 lines) ✅
   - Renders when `gameState.mode === "medical-consulting"`
   - Medical case description input and examples
   - Medical relevance scoring for specialist matching
   - Selection checkboxes and start consultation button
   - onSelectDoctors callback with agent IDs

4. **Sidebar.jsx** (Updated) ✅
   - Added three modes to NAV_ITEMS array (with isMode: true):
     - "learn-law" → Learn Indian Laws (BookOpen icon)
     - "interview-simulator" → Interview Simulator (Briefcase icon)
     - "medical-consulting" → Medical Consulting (Stethoscope icon)
   - All three now appear in "Debate Modes" section alongside Council Combat, Mentor Dashboard, Time-Capsule
   - Removed FEATURE_ITEMS array and Features section

5. **App.jsx** (Updated) ✅
   - Updated handleTabChange to recognize these modes and call setMode() for them
   - Imported LearnLawPage, InterviewSimulatorPage, MedicalConsultingPage
   - Added 3 agent selection handlers
   - Added conditional rendering based on gameState.mode (not activeTab)
   - When user clicks a feature mode in Sidebar, it calls setMode(mode) and displays the appropriate page
   - Removed onFeatureSelect handler and prop (no longer needed)

### How It Works Now:
1. User clicks "Learn Indian Laws" button in Sidebar Debate Modes section
2. `onTabChange("learn-law")` is called
3. `handleTabChange()` detects it's a mode and calls `setMode("learn-law")`
4. `gameState.mode` becomes "learn-law"
5. App.jsx checks `gameState.mode === "learn-law"` and renders LearnLawPage
6. User selects agents and clicks "Start Law Session"
7. `handleSelectExperts()` toggles agents into player team using `toggleMember()`
8. User can then proceed with the debate/session

### 🚀 NEXT IMMEDIATE STEPS (Phase 2)

1. **Create backend/routes/features.routes.js** (80 lines)
   - `POST /features/law-panel` - Accept topic, return law_makers agents
   - `POST /features/interview-panel` - Accept scenario, return interviewers
   - `POST /features/medical-panel` - Accept case description, return specialists

2. **Create backend/services/featuresService.js** (200 lines)
   - `generateLawPanel(topic)` - Score law_makers by relevance
   - `generateInterviewPanel(scenario)` - Map scenario to interviewers
   - `generateMedicalPanel(medicalCase)` - Score specialists by relevance

3. **Update backend/server.js** (2-3 lines)
   - Add: `const featuresRoutes = require('./routes/features.routes')`
   - Add: `app.use('/api/features', featuresRoutes)`

4. **Optional: Enhance frontend API calls**
   - Create feature service in `frontend/src/lib/featuresApi.js`
   - Call backend endpoints when generating panels (or keep frontend-only scoring)

### 🎯 WORK HANDOFF: Where to Continue

If another agent takes over at this point:

**Frontend is READY AS MODES. Backend is NEXT.**

**To continue from here:**
1. Open `backend/routes/features.routes.js` (create new)
2. Import PreBuildAgents.js data: `const { law_makers, interview_panel, medical_specialists } = require('../PreBuildAgents')`
3. Implement the 3 POST route handlers as described above
4. Create backend/services/featuresService.js with the service functions
5. Update server.js to register the routes
6. Test by calling the endpoints from the frontend (feature pages already have mock 800ms delays for easier testing)

**Expected UI Flow:**
1. User clicks "Learn Indian Laws" button in Debate Modes section
2. Feature page renders with gameState.mode = "learn-law"
3. User inputs topic and clicks "Generate Panel"
4. Frontend calls backend `/api/features/law-panel` (or uses local scoring)
5. Backend returns filtered agents with relevance scores
6. Frontend displays agents with checkboxes
7. User selects agents and clicks "Start Law Session"
8. handleSelectExperts callback adds agents to player team
9. gameState is updated and user can start the session

---

## 📁 File Summary

### Tier 1: Feature Pages (COMPLETE)
- ✅ `frontend/src/components/LearnLawPage.jsx` - Legal learning interface
- ✅ `frontend/src/components/InterviewSimulatorPage.jsx` - Interview practice interface
- ✅ `frontend/src/components/MedicalConsultingPage.jsx` - Medical consultation interface

### Tier 2: Navigation Integration (COMPLETE)
- ✅ `frontend/src/components/Sidebar.jsx` - Updated with feature buttons
- ✅ `frontend/src/App.jsx` - Integrated feature pages and handlers

### Tier 3: Backend Routes (PENDING)
- ⏳ `backend/routes/features.routes.js` - Feature API endpoints
- ⏳ `backend/services/featuresService.js` - Agent filtering logic
- ⏳ `backend/server.js` - Register feature routes

### No Changes Needed
- `backend/PreBuildAgents.js` - Used as-is for agent data
- `frontend/src/store/useAppStore.js` - State management works as-is
- `frontend/src/components/Sidebar.jsx` - Feature buttons ready (onFeatureSelect callback must be wired)

---

## 📝 Testing Checklist (When Complete)

Frontend (Ready to test now):
- [ ] Navigate to Learn Law feature from Sidebar
- [ ] Enter legal topic and click example buttons
- [ ] Verify agents are displayed
- [ ] Select law experts and click "Start Law Session"
- [ ] Verify agent selection works (check player team in gameState)
- [ ] Navigate to Interview Simulator
- [ ] Select scenario type and verify interviewer matching
- [ ] Navigate to Medical Consulting
- [ ] Enter case description and verify specialist matching
- [ ] Test all three features work and don't interfere with normal game flow

Backend (Test after implementing routes):
- [ ] POST /api/features/law-panel with topic → Returns law_makers array
- [ ] POST /api/features/interview-panel with scenario → Returns interview_panel array
- [ ] POST /api/features/medical-panel with case → Returns medical_specialists array
- [ ] Relevance scores are correct
- [ ] Only relevant agents returned

Integration:
- [ ] Feature pages can call backend and update agent listings
- [ ] Selected agents integrate with game state
- [ ] Debate page receives selected agents correctly
- [ ] Session completes successfully with feature experts

---

## 📌 Notes
- All three features reuse the existing `/debate` page for the actual session
- PreBuildAgents.js is already available with 45+ agents across 6 categories
- The root project's `useAppStore.startSession()` method should accept the feature-generated agents
- API response format should match what the existing debate UI expects

---

**Last Updated:** April 14, 2026  
**Created By:** AI Agent  
**Status:** Ready for implementation
