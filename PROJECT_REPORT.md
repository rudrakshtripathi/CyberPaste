
# Project Report: CyberPaste – Secure AI-Powered Pastebin

**Author**: Firebase Studio AI
**Date**: August 2, 2024
**Version**: 1.0

---

## 1. Introduction & Problem Statement

### 1.1 The Problem with Traditional Pastebins

Traditional pastebin platforms, while useful for quickly sharing text and code snippets, suffer from several critical drawbacks in the modern development landscape:

*   **Lack of Security and Encryption**: Most platforms store pastes in plaintext, making them vulnerable to unauthorized access and data breaches. Sensitive information, such as API keys, configuration files, or proprietary code, can be easily exposed.
*   **No Intelligent Assistance**: Standard pastebins are static storage bins. They lack features to help developers understand, debug, or improve the code they share. This misses a significant opportunity to add value to the development workflow.
*   **Limited Collaboration and Access Control**: These platforms typically offer public or unlisted pastes, with no fine-grained control over who can view or edit the content. This makes them unsuitable for team-based collaboration on private code.

### 1.2 Justification for a Modern Solution

The shortcomings of traditional platforms highlight the need for a modern, secure, and intelligent alternative. CyberPaste is designed to fill this gap by providing a platform that prioritizes security through client-side encryption while leveraging generative AI to enhance developer productivity. It transforms the pastebin from a simple text-sharing tool into a secure, collaborative, and intelligent development assistant.

---

## 2. Objectives of CyberPaste

The primary objectives for the CyberPaste project are:

*   **End-to-End Encrypted Pastes**: To ensure that only the creator and intended recipients can view the content of a paste. All encryption and decryption operations must occur on the client side, meaning the server never has access to the unencrypted data.
*   **AI-Powered Code Assistance**: To integrate generative AI to provide real-time code analysis, including:
    *   **Syntax Fixing**: Automatically identify and correct syntax errors.
    *   **Complexity Analysis**: Explain the time and space complexity of algorithms.
*   **Secure and Ephemeral Sharing**: To allow users to create pastes that automatically expire after a configurable duration, reducing the risk of long-term data exposure.
*   **Intuitive User Experience**: To deliver a seamless and modern user interface with a distinctive "cyberpunk" aesthetic, including features like a command palette for quick access to functionality.

---

## 3. System Architecture & Workflow

CyberPaste is built on a modern Jamstack architecture, leveraging serverless functions, a managed database, and a powerful frontend framework to deliver a scalable and performant application.

### 3.1 High-Level Architecture

The system can be described as follows:

*   **Frontend (Client)**: A Next.js application runs in the user's browser. It is responsible for rendering the UI, handling user interactions, and performing all client-side encryption/decryption operations. It communicates with the backend via Server Actions.
*   **Backend (Serverless Functions & Database)**: Supabase provides the backend infrastructure.
    *   **Database (PostgreSQL)**: Stores all paste metadata, including the encrypted content, expiration TTL, view counts, and other settings.
    *   **Server Actions**: Secure API-less functions written in TypeScript that handle database operations like creating and retrieving pastes. These run on the server and interact directly with the Supabase database.
*   **Generative AI Service**: Google's Gemini models, accessed via Genkit, provide the AI capabilities for syntax fixing and code analysis. These are called from dedicated server-side flows.

### 3.2 Workflow

1.  **Paste Creation**:
    *   The user enters code into the `PasteEditor` on the frontend.
    *   If encryption is enabled, a `CryptoKey` is generated in the browser. The content is encrypted using AES-GCM.
    *   The user submits the form, triggering the `createPaste` Server Action.
    *   The action saves the (potentially encrypted) content and metadata to the Supabase database, generating a unique ID.
    *   The frontend receives the new paste URL. If encrypted, the encryption key is appended to the URL hash (`#key=...`).
2.  **Paste Viewing**:
    *   The user navigates to a paste URL (`/p/[id]`).
    *   The Next.js page fetches the paste data from Supabase using the `getPaste` action.
    *   If the paste is encrypted, the `PasteViewer` component reads the key from the URL hash, decrypts the content in the browser, and then renders it.
    *   The viewer also calls the `incrementPasteViews` action to update the view count.

---

## 4. Technologies Used

*   **Frontend**:
    *   **Framework**: Next.js (App Router)
    *   **Language**: TypeScript
    *   **Styling**: Tailwind CSS, ShadCN UI
    *   **State Management**: React Hooks (`useState`, `useEffect`)
*   **Backend**:
    *   **Platform**: Supabase
    *   **Database**: PostgreSQL
    *   **API Layer**: Next.js Server Actions
*   **Generative AI**:
    *   **Framework**: Genkit
    *   **Model Provider**: Google AI (Gemini models)
*   **Deployment**:
    *   **Hosting**: Firebase App Hosting (or other modern Jamstack hosts like Vercel/Netlify)

---

## 5. Implementation Details

### 5.1 Client-Side Encryption

Client-side encryption is implemented using the Web Crypto API (`crypto.subtle`).

**Key Generation & Encryption (`src/lib/crypto.ts`)**:
```typescript
'use client';

// Generates a new AES-GCM key
export async function generateKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

// Encrypts content with a given key
export async function encrypt(content: string, key: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
  const encodedContent = new TextEncoder().encode(content);

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedContent
  );

  // Prepend IV to ciphertext for decryption
  const fullMessage = new Uint8Array(iv.length + ciphertext.byteLength);
  fullMessage.set(iv);
  fullMessage.set(new Uint8Array(ciphertext), iv.length);

  // Return as a single base64 string
  return btoa(String.fromCharCode.apply(null, Array.from(fullMessage)));
}
```

### 5.2 Paste Creation & Retrieval

Server Actions in `src/lib/actions/paste.ts` handle all database interactions with Supabase.

**Creating a Paste (`src/lib/actions/paste.ts`)**:
```typescript
'use server';

import { createClient } from '@supabase/supabase-js';
// ... other imports

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

export async function createPaste(
  tabs: StoredTab[],
  ttl: number,
  encrypted: boolean
): Promise<{ id: string }> {
  const id = generateId();
  const now = new Date();
  const expiresAt = ttl > 0 ? new Date(now.getTime() + ttl * 1000) : null;

  // Insert paste metadata
  const { error: pasteErr } = await supabase.from('stored_pastes').insert({
    id,
    ttl,
    views: 0,
    encrypted,
    created_at: now.toISOString(),
    expires_at: expiresAt ? expiresAt.toISOString() : null,
  });
  if (pasteErr) throw pasteErr;

  // Insert tabs
  const { error: tabErr } = await supabase.from('stored_tabs').insert(
    tabs.map((t) => ({
      paste_id: id,
      name: t.name,
      lang: t.lang,
      content: t.content,
    }))
  );
  if (tabErr) throw tabErr;

  revalidatePath('/'); // To update active paste count
  return { id };
}
```

### 5.3 AI-Powered Syntax Fixing

The AI features are implemented using Genkit flows that call the Gemini model.

**Syntax Fixer Flow (`src/ai/flows/syntax-ai-fixer.ts`)**:
```typescript
'use server';
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SyntaxAiFixerInputSchema = z.object({
  code: z.string().describe('The code to be fixed.'),
  language: z.string().describe('The programming language of the code.'),
});

const SyntaxAiFixerOutputSchema = z.object({
  fixedCode: z.string().describe('The code with syntax errors fixed.'),
});

const prompt = ai.definePrompt({
  name: 'syntaxAiFixerPrompt',
  input: {schema: SyntaxAiFixerInputSchema},
  output: {schema: SyntaxAiFixerOutputSchema},
  prompt: `You are a helpful AI assistant that helps fix syntax errors in code.

You will receive code and the programming language it is written in. You will respond with the fixed code.

Language: {{{language}}}
Code: {{{code}}}
`,
});

const syntaxAiFixerFlow = ai.defineFlow(
  {
    name: 'syntaxAiFixerFlow',
    inputSchema: SyntaxAiFixerInputSchema,
    outputSchema: SyntaxAiFixerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
```

---

## 6. Key Features

*   **Secure Paste Sharing**: Create public or encrypted pastes with optional expiry times (1 hour, 1 day, 1 week, 1 month, or never).
*   **Multi-File Pastes**: Support for multiple tabs within a single paste, each with its own filename and language selection.
*   **AI Assistant**:
    *   **Syntax Fixer**: One-click AI-powered correction for syntax errors.
    *   **Time Complexity Analyzer**: On-demand analysis of algorithms' time and space complexity.
*   **Modern UI/UX**:
    *   A unique, aesthetically pleasing cyberpunk theme.
    *   Responsive design for both desktop and mobile devices.
    *   Command Palette (`Ctrl+K`) for quick access to actions.
*   **Raw View**: Ability to view the raw text content of any unencrypted paste.

---

## 7. Testing & Validation

A comprehensive testing strategy is crucial for ensuring the reliability and security of CyberPaste.

*   **Unit Testing**: Key utility functions, such as the encryption/decryption helpers in `src/lib/crypto.ts`, should be unit-tested to ensure their correctness.
*   **Integration Testing**: The interaction between the frontend components and the backend Server Actions needs to be tested to validate the end-to-end flows for creating and viewing pastes.
*   **Security Validation**:
    *   **Penetration Testing**: Manual and automated tests should be conducted to ensure that the client-side encryption is sound and that there are no vulnerabilities that could expose the encryption key or plaintext data.
    *   **Dependency Scanning**: Regularly scan project dependencies for known vulnerabilities.

---

## 8. Deployment & Hosting

*   **Deployment**: The application is configured for continuous deployment. Pushing changes to the main Git branch automatically triggers a new build and deployment.
*   **Hosting**: The project is hosted on Firebase App Hosting, which is optimized for Next.js applications and provides global CDN, automatic scaling, and HTTPS by default.
*   **Supabase Configuration**: The Supabase project is configured with a database schema for `stored_pastes` and `stored_tabs`. Row Level Security (RLS) policies are enabled to ensure that users can only access and modify data as permitted by the application's logic. Environment variables (`SUPABASE_URL`, `SUPABASE_KEY`) are securely stored in the hosting provider's settings.

---

## 9. Future Enhancements

*   **Expanded Language Support**: Add syntax highlighting and AI assistance for a wider range of programming languages.
*   **User Accounts & Dashboard**: Implement user authentication to allow users to manage their pastes from a personal dashboard.
*   **Real-time Collaborative Editing**: Integrate a CRDT-based solution (like Y.js) to enable multiple users to edit a paste simultaneously, Google Docs-style.
*   **Enhanced AI Features**: Introduce more advanced AI capabilities, such as code refactoring suggestions, performance optimization tips, and automatic documentation generation.

---

## 10. Conclusion

CyberPaste represents a significant advancement over traditional pastebin platforms. By combining robust client-side encryption with powerful generative AI features, it provides a secure, intelligent, and user-friendly tool for modern developers. It not only solves the critical security flaws of existing solutions but also enhances developer productivity by integrating intelligent assistance directly into the code-sharing workflow. As the project evolves, it has the potential to become an indispensable tool for individual developers and teams alike.
