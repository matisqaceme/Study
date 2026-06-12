import { useState } from 'react'

/*
 * Posts to Netlify Forms (the hidden registration form lives in
 * index.html). Submissions show up in the Netlify dashboard under
 * Forms > book-a-call. Cannot be tested locally; send one test
 * submission after deploying.
 */
export default function BookForm() {
  const [status, setStatus] = useState('idle')

  async function onSubmit(e) {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget))
    setStatus('sending')
    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ 'form-name': 'book-a-call', ...data }).toString(),
      })
      if (!res.ok) throw new Error(String(res.status))
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="form-done" role="status">
        <p className="form-done-lead">Request received.</p>
        <p className="form-done-sub">We reply within one business day.</p>
      </div>
    )
  }

  return (
    <form
      className="book-form"
      name="book-a-call"
      method="POST"
      data-netlify="true"
      onSubmit={onSubmit}
    >
      <p hidden aria-hidden="true">
        <label>
          Leave this empty: <input name="bot-field" />
        </label>
      </p>
      <div className="form-row">
        <label className="form-field">
          <span className="form-label mono">Name</span>
          <input name="name" type="text" required autoComplete="name" placeholder="Your name" />
        </label>
        <label className="form-field">
          <span className="form-label mono">Work email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
          />
        </label>
      </div>
      <label className="form-field">
        <span className="form-label mono">What do you sell?</span>
        <input
          name="company"
          type="text"
          required
          placeholder="E.g. IT staffing for fintech teams"
        />
      </label>
      <button className="btn form-submit" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending...' : 'Request a call'}
      </button>
      {status === 'error' && (
        <p className="form-error" role="alert">
          That did not go through. Email us instead:{' '}
          <a href="mailto:hello@matiscale.com">hello@matiscale.com</a>
        </p>
      )}
    </form>
  )
}
