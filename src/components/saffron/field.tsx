import {
  memo,
  useRef,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="block">
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-muted">
        {label}
      </label>
      {children}
      {hint ? <p className="mt-1.5 text-xs leading-snug text-faint">{hint}</p> : null}
    </div>
  );
}

const controlClass =
  "h-12 w-full rounded-2xl bg-surface px-4 text-base text-ink shadow-card outline-none transition-[box-shadow] duration-150 placeholder:text-faint focus:shadow-[0_0_0_2px_var(--color-saffron)]";

export function TextInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlClass, className)} {...props} />;
}

export function TextArea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        controlClass,
        "h-24 resize-none py-3 leading-normal",
        className,
      )}
      {...props}
    />
  );
}

/** Uncontrolled so Telegram WebView does not stick Cyrillic input. */
export const UncontrolledInput = memo(function UncontrolledInput({
  id,
  onValue,
  maxLength = 80,
  placeholder,
  inputMode = "text",
  autoCapitalize = "sentences",
  filter,
}: {
  id: string;
  onValue: (value: string) => void;
  maxLength?: number;
  placeholder?: string;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  autoCapitalize?: string;
  filter?: (value: string) => string;
}) {
  const last = useRef("");
  return (
    <input
      id={id}
      type="text"
      inputMode={inputMode}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize={autoCapitalize}
      spellCheck={false}
      maxLength={maxLength}
      enterKeyHint="next"
      placeholder={placeholder}
      className={controlClass}
      onInput={(event) => {
        const raw = event.currentTarget.value;
        const next = filter ? filter(raw) : raw;
        if (filter && next !== raw) event.currentTarget.value = next;
        if (next === last.current) return;
        last.current = next;
        onValue(next);
      }}
    />
  );
});

export const UncontrolledTextarea = memo(function UncontrolledTextarea({
  id,
  onValue,
  maxLength = 200,
  placeholder,
  rows = 2,
}: {
  id: string;
  onValue: (value: string) => void;
  maxLength?: number;
  placeholder?: string;
  rows?: number;
}) {
  const last = useRef("");
  return (
    <textarea
      id={id}
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      maxLength={maxLength}
      rows={rows}
      placeholder={placeholder}
      className={cn(controlClass, "h-20 resize-none py-3 leading-normal")}
      onInput={(event) => {
        const next = event.currentTarget.value;
        if (next === last.current) return;
        last.current = next;
        onValue(next);
      }}
    />
  );
});

export const NameInput = memo(function NameInput({
  id = "client-name",
  onValue,
}: {
  id?: string;
  onValue: (value: string) => void;
}) {
  return (
    <UncontrolledInput
      id={id}
      onValue={onValue}
      maxLength={80}
      placeholder="Как к вам обращаться"
      autoCapitalize="words"
    />
  );
});

export const InscriptionInput = memo(function InscriptionInput({
  id = "inscription",
  onValue,
}: {
  id?: string;
  onValue: (value: string) => void;
}) {
  return (
    <UncontrolledTextarea
      id={id}
      onValue={onValue}
      maxLength={80}
      rows={2}
      placeholder="Можно пропустить"
    />
  );
});
