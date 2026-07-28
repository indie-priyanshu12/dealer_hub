# Requirements Document: Car Dealership Inventory System (TDD Kata)

## 1. Overview

### 1.1 Objective
The goal of this kata is to design, build, and test a **full-stack Car Dealership Inventory System**. The project is meant to evaluate your abilities across several dimensions of modern software development:

- API design and development
- Database design and management
- Frontend implementation
- Automated testing
- Modern development workflows, **including the effective and transparent use of AI tools**

### 1.2 What You're Building
At a high level, you are building a system that lets a car dealership manage its vehicle inventory. This includes:

- A **backend API** that stores vehicles, handles user accounts, and enforces business rules (e.g., you can't purchase a vehicle with zero stock).
- A **frontend web application** that lets customers browse/search/purchase vehicles, and lets admins manage the inventory.
- A full **test suite** built using Test-Driven Development practices.
- **Documentation** describing the project, how to run it, and how AI tools were used throughout.

---

## 2. Core Requirements

### 2.1 Backend API (RESTful)

You are to build a robust backend API that will serve as the "brain" of the application — it owns all business logic, data storage, and security.

#### 2.1.1 Technology Choice
Pick **one** of the following stacks (do not mix multiple):

| Language | Framework Options |
|---|---|
| Node.js / TypeScript | Express or NestJS |
| Python | Django or FastAPI |
| Ruby | Rails |

#### 2.1.2 Database
- The application **must** connect to a real, persistent database. Acceptable examples include:
  - PostgreSQL
  - MongoDB
  - SQLite
- **An in-memory database (e.g., a plain JS array/object used as a data store) is not sufficient.** Data must persist across server restarts.

#### 2.1.3 User Authentication
- Users must be able to **register** a new account.
- Users must be able to **log in** with existing credentials.
- Implement **token-based authentication** (e.g., JWT — JSON Web Tokens).
  - Certain API endpoints must be **protected**, meaning a valid token is required to access them (see endpoint table below for which ones).
  - Consider distinguishing between regular users and **admin users**, since some actions (deleting a vehicle, restocking inventory) are admin-only.

#### 2.1.4 API Endpoints

**Authentication Endpoints (public):**

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user account |
| POST | `/api/auth/login` | Log in and receive an auth token |

**Vehicle Endpoints (protected — require a valid auth token):**

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/vehicles` | Add a new vehicle to inventory | Authenticated user |
| GET | `/api/vehicles` | View a list of all available vehicles | Authenticated user |
| GET | `/api/vehicles/search` | Search for vehicles by make, model, category, or price range | Authenticated user |
| PUT | `/api/vehicles/:id` | Update a vehicle's details | Authenticated user |
| DELETE | `/api/vehicles/:id` | Delete a vehicle | **Admin only** |

**Inventory Endpoints (protected):**

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/vehicles/:id/purchase` | Purchase a vehicle, decreasing its quantity in stock | Authenticated user |
| POST | `/api/vehicles/:id/restock` | Restock a vehicle, increasing its quantity in stock | **Admin only** |

> **Note:** The exact "admin only" enforcement mechanism (roles, permissions, claims in JWT, etc.) is up to you, but it must be enforced server-side, not just hidden in the frontend UI.

#### 2.1.5 Vehicle Data Model
Each vehicle record must, at minimum, include the following fields:

- **Unique ID** — a unique identifier for the vehicle
- **Make** — e.g., Toyota, Ford
- **Model** — e.g., Corolla, Mustang
- **Category** — e.g., Sedan, SUV, Truck, Coupe
- **Price** — the sale price of the vehicle
- **Quantity in stock** — how many units of this vehicle are currently available

You are free to add additional fields (e.g., year, color, VIN, description, image URL) if it enhances the application, as long as the required fields above are present.

---

### 2.2 Frontend Application

You must build a modern, single-page application (SPA) that interacts with your backend API.

#### 2.2.1 Technology Requirements
You must use:
- **HTML5**
- **CSS3**
- **Tailwind CSS**
- **React**

#### 2.2.2 Required Functionality

1. **User registration and login forms**
   - Forms that call the `/api/auth/register` and `/api/auth/login` endpoints.
   - Store and use the returned auth token for subsequent protected requests.

2. **Dashboard / homepage**
   - Displays all available vehicles retrieved from `GET /api/vehicles`.

3. **Search and filter functionality**
   - UI controls that let a user search/filter vehicles by make, model, category, or price range, using `GET /api/vehicles/search`.

4. **Purchase button**
   - Each vehicle listing should have a "Purchase" button.
   - This button must be **disabled** when the vehicle's quantity in stock is zero.

5. **Admin-only management UI**
   - For users with admin privileges: forms/UI to **add**, **update**, and **delete** vehicles, and to **restock** inventory.
   - These UI elements should only be accessible/visible to admin users (in addition to the backend enforcing this).

#### 2.2.3 Design Expectations
- This is your opportunity to demonstrate creativity and design sensibility.
- The application should be:
  - **Visually appealing**
  - **Responsive** (usable on different screen sizes, including mobile)
  - Focused on providing a **great overall user experience**

---

## 3. Process & Technical Guidelines

### 3.1 Test-Driven Development (TDD)
- Tests must be **written before** the functionality they test is implemented.
- Your commit history should clearly show the **Red-Green-Refactor** cycle:
  - **Red** — write a failing test.
  - **Green** — write the minimum code to make it pass.
  - **Refactor** — clean up the implementation while keeping tests green.
- This is expected **especially for backend logic** (API endpoints, business rules, authentication, etc.).
- Aim for **high test coverage** with **meaningful** test cases — not just tests that pad coverage numbers, but tests that actually validate behavior (happy paths, edge cases, error conditions).

### 3.2 Clean Coding Practices
- Write code that is **clean, readable, and maintainable**.
- Follow **SOLID principles** and other established software design best practices.
- Code should be **well-documented**:
  - Meaningful comments where they add value.
  - Clear, descriptive naming conventions for variables, functions, classes, and files.

### 3.3 Git & Version Control
- Use **Git** for version control throughout the project.
- Commit changes **frequently**.
- Each commit message should be **clear and descriptive**, collectively **narrating your development journey** (i.e., someone reading your commit log should be able to follow how the project evolved).

### 3.4 AI Usage Policy (Important)

AI tools are considered a critical part of the modern development workflow. You are **encouraged and expected** to use them — but you must be **transparent** about how you use them.

#### 3.4.1 AI Co-authorship on Commits
- For **every commit** where an AI tool was used (e.g., to generate boilerplate, write tests, help debug), you must add the AI as a **co-author** in the commit message.
- **Format:** At the end of your commit message, add two blank lines, followed by a `Co-authored-by` trailer.

  **Example:**
  ```
  git commit -m "feat: Implement user registration endpoint

  Used an AI assistant to generate the initial boilerplate for the
  controller and service, then manually added validation logic.

  Co-authored-by: AI Tool Name <AI@users.noreply.github.com>"
  ```

#### 3.4.2 README Documentation — "My AI Usage" Section
Your `README.md` must include a detailed section titled **"My AI Usage"**, covering:

1. **Which AI tools you used** (e.g., GitHub Copilot, ChatGPT, Gemini, Claude, etc.).
2. **How you used them** — be specific. Examples:
   - "I used Gemini to brainstorm API endpoint structures."
   - "I asked Copilot to generate unit tests for my service layer."
3. **Your reflection** on how AI impacted your workflow — what worked well, what didn't, where you had to override or correct the AI, etc.

#### 3.4.3 Interview Discussion
- Be prepared to discuss your AI usage **in detail** during the interview.
- The interviewers are specifically interested in **how you leverage these tools effectively and responsibly** — not just that you used them.

---

## 4. Deliverables

Your final submission must include:

1. **A public Git repository link** (e.g., on GitHub, GitLab).

2. **A comprehensive `README.md` file** that includes:
   - A clear explanation of the project (what it does, how it's structured).
   - Detailed instructions on how to set up and run the project locally — **both backend and frontend**.
   - Screenshots of your final application in action.
   - The mandatory **"My AI Usage"** section (see 3.4.2 above).
   - A **test report** showing the results of your test suite (e.g., coverage summary, pass/fail counts).

3. **A `PROMPTS.md` file**, located in the **root folder** of the project, containing your **entire AI tooling chat history** — including the prompts you wrote and (ideally) the responses you received — for full transparency into your AI-assisted workflow.

4. **(Optional — Brownie Points)** A link to the **deployed, live application**, hosted on a platform such as:
   - Vercel
   - Netlify
   - Heroku
   - AWS

---

## 5. Important Notes

- **Plagiarism is strictly forbidden.** While AI assistance is encouraged, submitting code copied from other repositories or developers will result in **immediate rejection**.
- The goal is to see **your own work**, augmented by modern tools — not a copy-paste job from someone else's project.
