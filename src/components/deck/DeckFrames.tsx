"use client";

import type { ComponentType } from "react";

/** Application configuration mock — full-viewport two-column layout. */
export function FrameOauthAppConfig() {
  return (
    <div className="flex w-full flex-col">
      <div className="grid min-h-[calc(100dvh-clamp(5.5rem,15vw,11rem))] w-full flex-1 grid-cols-1 divide-y divide-zinc-700/35 md:grid-cols-2 md:divide-x md:divide-y-0">
        {/* First half: application name */}
        <div className="flex min-h-[min(50dvh,28rem)] flex-col justify-center px-[clamp(1.25rem,5vw,4rem)] py-[clamp(2rem,6vw,5rem)] md:min-h-0">
          <label className="text-[clamp(1.05rem,2.4vw,1.5rem)] font-normal tracking-wide text-zinc-400">
            Name of the application
          </label>
          <div
            className="mt-8 h-[3px] w-full max-w-none rounded-full bg-zinc-100/85"
            aria-hidden
          />
        </div>

        {/* Second half: domains & redirect URIs */}
        <div className="flex min-h-[min(50dvh,28rem)] flex-col justify-center gap-[clamp(2.5rem,8vw,5rem)] px-[clamp(1.25rem,5vw,4rem)] py-[clamp(2rem,6vw,5rem)] md:min-h-0">
          <section>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <h2 className="text-[clamp(1.05rem,2.2vw,1.45rem)] font-medium text-zinc-300">
                  Add domain
                </h2>
                <p className="mt-3 max-w-[40ch] text-[clamp(0.8rem,1.6vw,1rem)] leading-relaxed text-zinc-500">
                  Domains your app will use for OAuth redirects and webhooks.
                </p>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-lg border border-zinc-600/80 bg-zinc-800/70 px-4 py-2 text-[clamp(0.75rem,1.4vw,0.9rem)] text-zinc-300 transition hover:bg-zinc-700/60"
              >
                + Add
              </button>
            </div>
          </section>

          <section>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <h2 className="text-[clamp(1.05rem,2.2vw,1.45rem)] font-medium text-zinc-300">
                  Redirect URIs
                </h2>
                <p className="mt-3 max-w-[40ch] text-[clamp(0.8rem,1.6vw,1rem)] leading-relaxed text-zinc-500">
                  URIs allowed to receive the authorization code after sign-in.
                </p>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-lg border border-zinc-600/80 bg-zinc-800/70 px-4 py-2 text-[clamp(0.75rem,1.4vw,0.9rem)] text-zinc-300 transition hover:bg-zinc-700/60"
              >
                + Add
              </button>
            </div>
          </section>
        </div>
      </div>

      <footer className="mt-0 flex w-full shrink-0 flex-wrap items-center gap-4 border-t border-zinc-700/45 px-[clamp(1.25rem,5vw,4rem)] py-[clamp(1.25rem,3vw,2rem)]">
        <button
          type="button"
          className="inline-flex h-10 items-center justify-center border border-zinc-500/60 bg-zinc-800/90 px-5 text-[0.9rem] font-normal tracking-wide text-zinc-300 transition hover:bg-zinc-700/80"
        >
          save
        </button>
        <button
          type="button"
          className="inline-flex h-10 items-center justify-center px-5 text-[0.9rem] font-normal tracking-wide text-zinc-500 transition hover:text-zinc-300 hover:underline"
        >
          cancel
        </button>
      </footer>
    </div>
  );
}

/** Generated credentials — static copy matching reference layout. */
export function FrameOauthCredentials() {
  return (
    <div className="flex w-full max-w-[min(40rem,92vw)] flex-col gap-10">
      <div>
        <h2 className="text-[clamp(0.8rem,1.6vw,0.95rem)] font-normal text-zinc-500">
          Client ID
        </h2>
        <p className="mt-3 font-mono text-[clamp(0.85rem,1.5vw,1rem)] leading-relaxed tracking-tight text-zinc-200">
          client_ID_KVNSWD_DRDNE_F6C8_SID
        </p>
      </div>
      <div>
        <h2 className="text-[clamp(0.8rem,1.6vw,0.95rem)] font-normal text-zinc-500">
          Client secret
        </h2>
        <p className="mt-3 font-mono text-[clamp(0.85rem,1.5vw,1rem)] leading-relaxed tracking-tight text-zinc-200">
          sk_live_EmCSAAfvedzBbl_JBDmDGxl
          <br />
          SSYDSN_IYCO7CEHY_4MvfbclgBqS
        </p>
      </div>
    </div>
  );
}

/** Centered sign-in control — full viewport vertical center. */
export function FrameOauthSignIn() {
  return (
    <div className="flex min-h-[calc(100dvh-clamp(5.5rem,15vw,11rem))] w-full flex-col items-center justify-center px-4">
      <button
        type="button"
        className="rounded-none border border-zinc-600/70 bg-zinc-800/95 px-10 py-3 text-[clamp(0.95rem,2vw,1.1rem)] font-normal tracking-wide text-zinc-200 transition hover:bg-zinc-700/90"
      >
        sign in with polaris
      </button>
    </div>
  );
}

const FRAMES: Record<string, ComponentType> = {
  "oauth-app-config": FrameOauthAppConfig,
  "oauth-credentials": FrameOauthCredentials,
  "oauth-signin": FrameOauthSignIn,
};

export function DeckFrameById({ id }: { id: string }) {
  const C = FRAMES[id];
  if (!C) {
    return (
      <p className="text-zinc-500">
        Unknown frame: <code className="text-zinc-400">{id}</code>
      </p>
    );
  }
  return <C />;
}
