"use client";
import { useState } from "react";
import { money } from "@/lib/site";
import { monthlyPayment } from "@/lib/vehicle";
import { ButtonLink } from "./ui";
export function PaymentCalculator({
  price = 30000,
  compact = false,
  vehicleId,
}: {
  price?: number;
  compact?: boolean;
  vehicleId?: string;
}) {
  const [amount, setAmount] = useState(price),
    [down, setDown] = useState(Math.round(price * 0.15)),
    [apr, setApr] = useState(8.9),
    [term, setTerm] = useState(60);
  return (
    <div className={`payment-calculator ${compact ? "is-compact" : ""}`}>
      <div className="calculator-top">
        <span className="mono">EXPLORE YOUR BUDGET</span>
        <h3>
          A little closer
          <br />
          than you think.
        </h3>
        <p className="payment-result">
          <strong>
            {money(monthlyPayment(amount, Math.min(down, amount), apr, term))}
          </strong>
          <span>/ month, estimated</span>
        </p>
      </div>
      <div className="calculator-fields">
        {!compact && (
          <label>
            Vehicle price
            <div className="input-prefix">
              <span>$</span>
              <input
                type="number"
                min="0"
                max="1000000"
                value={amount}
                onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
              />
            </div>
          </label>
        )}
        <label>
          Down payment
          <div className="input-prefix">
            <span>$</span>
            <input
              type="number"
              min="0"
              max={amount}
              value={down}
              onChange={(e) =>
                setDown(Math.max(0, Math.min(amount, Number(e.target.value))))
              }
            />
          </div>
        </label>
        <label>
          APR <span>{apr.toFixed(1)}%</span>
          <input
            aria-label="APR"
            type="range"
            min="0"
            max="25"
            step="0.1"
            value={apr}
            onChange={(e) => setApr(Number(e.target.value))}
          />
        </label>
        <label>
          Loan term
          <select
            value={term}
            onChange={(e) => setTerm(Number(e.target.value))}
          >
            {[36, 48, 60, 72, 84].map((n) => (
              <option key={n} value={n}>
                {n} months
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="calculator-disclosure">
        Illustration only, not a financing offer or approval. Excludes taxes,
        title, registration, dealer fees and optional products. Actual terms
        depend on lender approval.
      </p>
      {compact && (
        <ButtonLink
          href={
            vehicleId
              ? `/financing/apply?entry_id=${encodeURIComponent(vehicleId)}`
              : "/financing/apply"
          }
          variant="text"
        >
          Apply for financing
        </ButtonLink>
      )}
    </div>
  );
}
