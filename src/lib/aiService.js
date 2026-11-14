import { supabase } from '@/lib/supabase'

/**
 * aiService
 *
 * Calls the WorkLedger ai-ask Supabase Edge Function.
 *
 * Security notes:
 *   - The function is invoked via supabase.functions.invoke(), which
 *     automatically attaches the current session's access token as the
 *     Authorization header. No token handling is done manually here.
 *   - No Anthropic key, ANTHROPIC_MODEL, or any server secret is present
 *     in this file or in any VITE_ environment variable.
 *   - The Edge Function verifies the token and enforces RLS — this client
 *     never fetches raw WorkLedger data itself for the AI request.
 *
 * @param {string} question - The user's plain-text question (non-empty, ≤1000 chars)
 * @returns {Promise<{ answer: string } | { error: string }>}
 */
export async function askAssistant(question) {
  const trimmed = (question ?? '').trim()
  if (!trimmed) {
    return { error: 'Please enter a question.' }
  }
  if (trimmed.length > 1000) {
    return { error: 'Your question is too long (max 1000 characters).' }
  }

  // supabase.functions.invoke automatically sets the Authorization: Bearer <token>
  // header from the current session, so no manual token handling is needed.
  const { data, error } = await supabase.functions.invoke('ai-ask', {
    body: { question: trimmed },
  })

  if (error) {
    // FunctionsHttpError carries a context object with the response body.
    // Attempt to extract a user-friendly message without leaking internals.
    let message = 'The assistant is unavailable. Please try again.'
    try {
      const context = error?.context
      if (context) {
        // context may be a Response object or a plain object
        const raw =
          typeof context.json === 'function'
            ? await context.json()
            : context
        if (raw?.error && typeof raw.error === 'string') {
          message = raw.error
        }
      }
    } catch {
      // Swallow parse failures — use the default message
    }
    return { error: message }
  }

  if (!data?.answer) {
    return { error: 'The assistant returned an empty response. Please try again.' }
  }

  return { answer: data.answer }
}
