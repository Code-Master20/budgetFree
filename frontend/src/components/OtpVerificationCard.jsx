export default function OtpVerificationCard({
  title,
  description,
  code,
  onCodeChange,
  message,
  onSend,
  onVerify,
  sending = false,
  verifying = false,
  sendLabel = "Send OTP",
  verifyLabel = "Verify OTP",
}) {
  return (
    <div className="glass-panel-strong rounded-[28px] p-5">
      <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
      <p className="section-copy mt-2">{description}</p>

      {message ? (
        <div className="mt-4 rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onSend}
          disabled={sending}
          className="secondary-button disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sending ? "Sending..." : sendLabel}
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <input
          value={code}
          onChange={(event) => onCodeChange(event.target.value)}
          className="field"
          inputMode="numeric"
          maxLength={6}
          placeholder="Enter 6-digit OTP"
        />
        <button
          type="button"
          onClick={onVerify}
          disabled={verifying || code.trim().length !== 6}
          className="primary-button disabled:cursor-not-allowed disabled:opacity-60"
        >
          {verifying ? "Verifying..." : verifyLabel}
        </button>
      </div>
    </div>
  );
}
