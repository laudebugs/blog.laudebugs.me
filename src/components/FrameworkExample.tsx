import type { SandpackProps } from '@codesandbox/sandpack-react';
import { type ComponentProps, lazy, Suspense, useState } from 'react';

// Nothing from the embed host is requested until the reader presses the button, so reading a post makes no
// third-party request. Sandpack itself is also loaded only then.
const Sandpack = lazy(() => import('@codesandbox/sandpack-react').then((module) => ({ default: module.Sandpack })));

type Props =
  | { kind: 'stackblitz'; projectId: string; openFile?: string; view?: string }
  | {
      kind: 'sandpack';
      files: SandpackProps['files'];
      template?: SandpackProps['template'];
      options?: SandpackProps['options'];
      customSetup?: SandpackProps['customSetup'];
    };

const palette = {
  light: {
    surface1: '#ffffff',
    surface2: '#d9ccf5',
    surface3: '#f1dcf0',
    clickable: '#6b4fc0',
    base: '#2b1530',
    disabled: '#7a5a80',
    hover: '#9a3fc4',
    accent: '#9a3fc4',
    error: '#9b1c31',
    errorSurface: '#ffd6ec',
  },
  dark: {
    surface1: '#211a3b',
    surface2: '#3a2d73',
    surface3: '#261e44',
    clickable: '#b9a2ff',
    base: '#f0eaff',
    disabled: '#a99dc9',
    hover: '#c78bf0',
    accent: '#c78bf0',
    error: '#ff9d78',
    errorSurface: '#5a3322',
  },
} as const;

function currentTheme(): 'light' | 'dark' {
  const set = document.documentElement.dataset.theme;
  if (set === 'light' || set === 'dark') return set;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function sandpackTheme(mode: 'light' | 'dark') {
  const dark = mode === 'dark';
  return {
    colors: palette[mode],
    syntax: {
      plain: dark ? '#f0eaff' : '#2b1530',
      comment: { color: dark ? '#a99dc9' : '#7a5a80', fontStyle: 'italic' as const },
      keyword: dark ? '#c78bf0' : '#8a2fb4',
      tag: dark ? '#7ebcff' : '#2a6fa8',
      punctuation: dark ? '#a99dc9' : '#7a5a80',
      definition: dark ? '#6fd6a8' : '#1f7a5a',
      property: dark ? '#7ebcff' : '#2a6fa8',
      static: dark ? '#ff9d78' : '#b2502a',
      string: dark ? '#6fd6a8' : '#1f7a5a',
    },
    font: {
      body: 'Karla, system-ui, sans-serif',
      mono: '"IBM Plex Mono", ui-monospace, monospace',
      size: '14px',
      lineHeight: '1.6',
    },
  };
}

export default function FrameworkExample(props: Props) {
  const [loaded, setLoaded] = useState(false);
  const stackblitz = props.kind === 'stackblitz';
  const href = stackblitz ? `https://stackblitz.com/edit/${props.projectId}` : undefined;
  const host = stackblitz ? 'stackblitz.com' : 'codesandbox.io';

  return (
    <figure className="live framework">
      <figcaption className="cap">
        <span>Live example</span>
        <span className="hint">{loaded ? `served by ${host}` : `loads from ${host} when you press the button`}</span>
      </figcaption>
      {loaded ? (
        stackblitz ? (
          <iframe
            title="Live example"
            className="framework-frame"
            src={`https://stackblitz.com/edit/${props.projectId}?embed=1&view=${props.view ?? 'preview'}${props.openFile ? `&file=${encodeURIComponent(props.openFile)}` : ''}&theme=${currentTheme()}`}
            loading="lazy"
            allow="clipboard-write"
          />
        ) : (
          <Suspense fallback={<p className="framework-wait">Loading the example…</p>}>
            <Sandpack
              files={props.files}
              template={props.template}
              options={{ ...props.options, initMode: 'immediate' } as ComponentProps<typeof Sandpack>['options']}
              customSetup={props.customSetup}
              theme={sandpackTheme(currentTheme())}
            />
          </Suspense>
        )
      ) : (
        <div className="framework-gate">
          <button type="button" onClick={() => setLoaded(true)}>
            Load the example ▸
          </button>
        </div>
      )}
      <div className="cap b">
        <span>{href ? 'Prefer a full page?' : 'Edit the code and watch it run.'}</span>
        {href && (
          <a href={href} rel="noopener noreferrer">
            Open on StackBlitz ↗
          </a>
        )}
      </div>
    </figure>
  );
}
